# predict_failure.py
"""
Machine Failure Prediction
------------------------
This script loads the *predictive_maintenance.csv* dataset, performs basic data cleaning
and feature scaling, trains two classifiers (Logistic Regression and K‑Nearest Neighbours),
evaluates them using accuracy, and finally outputs the predicted failure probability
for each sample in the test set.

Usage
-----
```bash
python predict_failure.py
```
The script prints a short summary and saves a CSV file (`test_predictions.csv`) with
columns:
- `index` – original row index
- `actual_failure` – ground‑truth label (0/1)
- `predicted_failure` – model's binary prediction
- `failure_probability` – probability of failure (0‑100 %)
"""

import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report

# ---------------------------------------------------------------------------
# 1️⃣ Load data
# ---------------------------------------------------------------------------
DATA_PATH = Path(__file__).parent / "predictive_maintenance.csv"
if not DATA_PATH.is_file():
    raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"Dataset shape: {df.shape}")

# ---------------------------------------------------------------------------
# 2️⃣ Basic cleaning & preparation
# ---------------------------------------------------------------------------
# Identify target columns. The dataset has two targets:
#   1️⃣ "Target" – binary 0/1 indicating whether a failure occurred.
#   2️⃣ "Failure Type" – categorical string describing the type of failure (only meaningful when Target=1).
# Use case‑insensitive matching to locate them.
binary_target_candidates = [c for c in df.columns if c.lower() == "target"]
if not binary_target_candidates:
    raise KeyError("Binary target column 'Target' not found in dataset")
TARGET_COL = binary_target_candidates[0]

# Find the failure‑type column (expects the words "failure" and "type" in the name)
type_target_candidates = [c for c in df.columns if "failure" in c.lower() and "type" in c.lower()]
if not type_target_candidates:
    raise KeyError("Failure type column not found in dataset")
TARGET_TYPE_COL = type_target_candidates[0]


# Drop rows with any missing values – quick fix for a capstone demo.
# For a production system you would consider imputation.
df_clean = df.dropna().reset_index(drop=True)

# Remove both target columns from the feature set to avoid leakage.
# Drop target columns
X = df_clean.drop(columns=[TARGET_COL, TARGET_TYPE_COL])
# Keep only numeric columns for modeling (avoid strings like IDs, categorical "Type")
X = X.select_dtypes(include=[np.number])

y_binary = df_clean[TARGET_COL]

# Encode the failure‑type labels (string → integer) for the type classifier.
le = LabelEncoder()
y_type = le.fit_transform(df_clean[TARGET_TYPE_COL])

# ---------------------------------------------------------------------------
# 3️⃣ Train‑test split
# ---------------------------------------------------------------------------
X_train, X_test, y_train_binary, y_test_binary = train_test_split(
    X, y_binary, test_size=0.2, random_state=42, stratify=y_binary
)
# For the failure‑type model we only keep rows where a failure actually occurred.
# This subset is split separately so the type classifier sees only failure cases.
X_type = X[y_binary == 1]
y_type_failure = y_type[y_binary == 1]
X_type_train, X_type_test, y_type_train, y_type_test = train_test_split(
    X_type, y_type_failure, test_size=0.2, random_state=42, stratify=y_type_failure
)
# Keep the original failure‑type labels for the test rows (used for evaluation & actual column)
actual_failure_type_series = df_clean.loc[X_test.index, TARGET_TYPE_COL]

# ---------------------------------------------------------------------------
# 4️⃣ Model pipelines (scaling + classifier)
# ---------------------------------------------------------------------------
logreg_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42))
])

# Failure‑type classifier (multiclass). Use the same scaling pipeline for consistency.
type_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42))
])

knn_pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", KNeighborsClassifier(n_neighbors=5))
])

# ---------------------------------------------------------------------------
# 5️⃣ Train models
# ---------------------------------------------------------------------------
logreg_pipe.fit(X_train, y_train_binary)
knn_pipe.fit(X_train, y_train_binary)
# Train the failure‑type model on failure‑only data.
type_pipe.fit(X_type_train, y_type_train)

# ---------------------------------------------------------------------------
# 6️⃣ Evaluate – Accuracy (the metric requested)
# ---------------------------------------------------------------------------
logreg_preds = logreg_pipe.predict(X_test)
knn_preds = knn_pipe.predict(X_test)

logreg_acc = accuracy_score(y_test_binary, logreg_preds)
knn_acc = accuracy_score(y_test_binary, knn_preds)

print("\n📊 Accuracy")
print(f"Logistic Regression: {logreg_acc:.4f}")
print(f"K‑Nearest Neighbours : {knn_acc:.4f}")

# Detailed classification report (optional but handy)
print("\n📋 Classification Report – Logistic Regression")
print(classification_report(y_test_binary, logreg_preds, digits=4))

# ---------------------------------------------------------------------------
# 7️⃣ Choose the best binary model (higher accuracy) and generate failure probabilities
# ---------------------------------------------------------------------------
best_binary_pipe = logreg_pipe if logreg_acc >= knn_acc else knn_pipe
binary_model_name = "Logistic Regression" if best_binary_pipe is logreg_pipe else "K‑Nearest Neighbours"

# Predict probabilities for the binary failure task
failure_prob = best_binary_pipe.predict_proba(X_test)[:, 1] * 100  # %
binary_preds = (failure_prob >= 50).astype(int)

# For rows predicted as failure, predict the failure type using the type model.
# We feed the whole X_test through the type pipeline; the model will output a class for every row,
# but we will only keep it where binary_preds == 1.
type_pred_int = type_pipe.predict(X_test)
# Convert integer labels back to original string labels.
type_pred_str = le.inverse_transform(type_pred_int)

# ---------------------------------------------------------------------------
# 8️⃣ Save predictions (including failure type)
# ---------------------------------------------------------------------------
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
