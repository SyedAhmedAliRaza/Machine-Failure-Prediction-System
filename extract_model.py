import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

df = pd.read_csv('predictive_maintenance.csv')
df_clean = df.dropna().reset_index(drop=True)

features = ['Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]']
X = df_clean[features]
y = df_clean['Target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

lr = LogisticRegression(max_iter=1000, random_state=42)
lr.fit(X_train_scaled, y_train)
lr_acc = accuracy_score(y_test, lr.predict(X_test_scaled))

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_scaled, y_train)
knn_acc = accuracy_score(y_test, knn.predict(X_test_scaled))

print("LR Accuracy (no UDI):", round(lr_acc, 4))
print("KNN Accuracy (no UDI):", round(knn_acc, 4))

print("SCALER_MEAN=" + json.dumps(scaler.mean_.tolist()))
print("SCALER_SCALE=" + json.dumps(scaler.scale_.tolist()))
print("LR_COEF=" + json.dumps(lr.coef_[0].tolist()))
print("LR_INTERCEPT=" + json.dumps(float(lr.intercept_[0])))

knn_data = {"X_train": X_train_scaled.tolist(), "y_train": y_train.values.tolist()}
with open("knn_train_5feat.json", "w") as f:
    json.dump(knn_data, f)
print("KNN data saved: " + str(len(knn_data["X_train"])) + " rows x " + str(len(knn_data["X_train"][0])) + " features")
