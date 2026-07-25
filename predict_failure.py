import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

DATA_PATH = Path(__file__).parent / "predictive_maintenance.csv"
if not DATA_PATH.is_file():
    raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"Dataset shape: {df.shape}")

binary_target_candidates = [c for c in df.columns if c.lower() == "target"]
if not binary_target_candidates:
    raise KeyError("Binary target column 'Target' not found in dataset")
TARGET_COL = binary_target_candidates[0]

type_target_candidates = [c for c in df.columns if "failure" in c.lower() and "type" in c.lower()]
if not type_target_candidates:
    raise KeyError("Failure type column not found in dataset")
TARGET_TYPE_COL = type_target_candidates[0]

df_clean = df.dropna().reset_index(drop=True)

X = df_clean.drop(columns=[TARGET_COL, TARGET_TYPE_COL])
X = X.select_dtypes(include=[np.number])

y_binary = df_clean[TARGET_COL]

le = LabelEncoder()
y_type = le.fit_transform(df_clean[TARGET_TYPE_COL])

X_train, X_test, y_train_binary, y_test_binary = train_test_split(
    X, y_binary, test_size=0.2, random_state=42, stratify=y_binary
)
X_type = X[y_binary == 1]
y_type_failure = y_type[y_binary == 1]
X_type_train, X_type_test, y_type_train, y_type_test = train_test_split(
    X_type, y_type_failure, test_size=0.2, random_state=42, stratify=y_type_failure
)
actual_failure_type_series = df_clean.loc[X_test.index, TARGET_TYPE_COL]

logreg_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42))
])

type_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42))
])

knn_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", KNeighborsClassifier(n_neighbors=5))
])

logreg_pipe.fit(X_train, y_train_binary)
knn_pipe.fit(X_train, y_train_binary)
type_pipe.fit(X_type_train, y_type_train)

logreg_preds = logreg_pipe.predict(X_test)
knn_preds = knn_pipe.predict(X_test)

logreg_acc = accuracy_score(y_test_binary, logreg_preds)
knn_acc = accuracy_score(y_test_binary, knn_preds)

print("\n📊 Accuracy")
print(f"Logistic Regression: {logreg_acc:.4f}")
print(f"K‑Nearest Neighbours : {knn_acc:.4f}")

print("\n📋 Classification Report – Logistic Regression")
print(classification_report(y_test_binary, logreg_preds, digits=4))

best_binary_pipe = logreg_pipe if logreg_acc >= knn_acc else knn_pipe
binary_model_name = "Logistic Regression" if best_binary_pipe is logreg_pipe else "K‑Nearest Neighbours"

failure_prob = best_binary_pipe.predict_proba(X_test)[:, 1] * 100
binary_preds = (failure_prob >= 50).astype(int)

type_pred_int = type_pipe.predict(X_test)
type_pred_str = le.inverse_transform(type_pred_int)

output_df = pd.DataFrame({
    "index": X_test.index,
    "actual_failure": y_test_binary,
    "predicted_failure": binary_preds,
    "failure_probability": failure_prob.round(2),
    "actual_failure_type": np.where(y_test_binary == 1, actual_failure_type_series, np.nan),
    "predicted_failure_type": np.where(binary_preds == 1, type_pred_str, np.nan),
})
output_path = Path(__file__).parent / "test_predictions.csv"
output_df.to_csv(output_path, index=False)

print(f"\n✅ Predictions saved to {output_path}")
print(f"Binary model used: {binary_model_name}")
print(f"Failure‑type model evaluated separately (accuracy not shown here).")
