/**
 * Machine Learning Prediction Engine
 *
 * Contains hardcoded model parameters extracted from trained Python models:
 * - StandardScaler mean & scale
 * - Logistic Regression coefficients & intercept
 * - KNN (K=5) with full training data
 *
 * Features (5): Air temperature [K], Process temperature [K],
 *               Rotational speed [rpm], Torque [Nm], Tool wear [min]
 *
 * Accuracy without UDI: LR 96.85%, KNN 97.55%
 */

import knnDataRaw from "./knn-data.json";

// ---------------------------------------------------------------------------
// Feature names (for display)
// ---------------------------------------------------------------------------
export const FEATURE_NAMES = [
  "Air Temperature (K)",
  "Process Temperature (K)",
  "Rotational Speed (rpm)",
  "Torque (Nm)",
  "Tool Wear (min)",
] as const;

export const FEATURE_KEYS = [
  "airTemp",
  "processTemp",
  "rotationalSpeed",
  "torque",
  "toolWear",
] as const;

export const FEATURE_RANGES = {
  airTemp: { min: 295.3, max: 304.5, step: 0.1, unit: "K" },
  processTemp: { min: 305.7, max: 313.8, step: 0.1, unit: "K" },
  rotationalSpeed: { min: 1168, max: 2886, step: 1, unit: "rpm" },
  torque: { min: 3.8, max: 76.6, step: 0.1, unit: "Nm" },
  toolWear: { min: 0, max: 253, step: 1, unit: "min" },
} as const;

// ---------------------------------------------------------------------------
// StandardScaler parameters
// ---------------------------------------------------------------------------
const SCALER_MEAN = [300.00545, 310.0060625, 1539.356875, 40.0033625, 107.685];
const SCALER_SCALE = [
  1.996719258558899, 1.4793392092734339, 180.9716311061885,
  10.018919350089297, 63.608026419627265,
];

// ---------------------------------------------------------------------------
// Logistic Regression parameters
// ---------------------------------------------------------------------------
const LR_COEF = [
  1.4354498558090243, -0.9675067856407006, 2.009054854056885,
  2.710953565392535, 0.7916492503201533,
];
const LR_INTERCEPT = -4.782846890875793;

// ---------------------------------------------------------------------------
// KNN Training data (loaded from JSON)
// ---------------------------------------------------------------------------
const knnData = knnDataRaw as { X_train: number[][]; y_train: number[] };

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------
function standardize(raw: number[]): number[] {
  return raw.map((val, i) => (val - SCALER_MEAN[i]) / SCALER_SCALE[i]);
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// ---------------------------------------------------------------------------
// Logistic Regression prediction
// ---------------------------------------------------------------------------
function predictLogisticRegression(scaledFeatures: number[]): {
  probability: number;
  prediction: number;
} {
  let z = LR_INTERCEPT;
  for (let i = 0; i < LR_COEF.length; i++) {
    z += LR_COEF[i] * scaledFeatures[i];
  }
  const probability = sigmoid(z) * 100; // percentage
  return {
    probability: Math.round(probability * 100) / 100,
    prediction: probability >= 50 ? 1 : 0,
  };
}

// ---------------------------------------------------------------------------
// KNN prediction (K=5)
// ---------------------------------------------------------------------------
function predictKNN(
  scaledFeatures: number[],
  k: number = 5
): { probability: number; prediction: number } {
  // Calculate distance to every training sample
  const distances: { distance: number; label: number }[] = [];
  for (let i = 0; i < knnData.X_train.length; i++) {
    distances.push({
      distance: euclideanDistance(scaledFeatures, knnData.X_train[i]),
      label: knnData.y_train[i],
    });
  }

  // Sort by distance and pick top K
  distances.sort((a, b) => a.distance - b.distance);
  const topK = distances.slice(0, k);

  // Majority vote
  const failureCount = topK.filter((d) => d.label === 1).length;
  const probability = (failureCount / k) * 100;

  return {
    probability: Math.round(probability * 100) / 100,
    prediction: probability >= 50 ? 1 : 0,
  };
}

// ---------------------------------------------------------------------------
// Failure type heuristic (based on sensor thresholds from the dataset)
// ---------------------------------------------------------------------------
function determineFailureType(raw: number[]): string {
  const [airTemp, processTemp, rotSpeed, torque, toolWear] = raw;
  const tempDiff = processTemp - airTemp;

  // Heat Dissipation Failure: high temp difference and low rotational speed
  if (tempDiff < 8.6 && rotSpeed < 1380) {
    return "Heat Dissipation Failure";
  }

  // Power Failure: extreme torque or speed
  if (torque * rotSpeed < 3500 || torque * rotSpeed > 9000) {
    return "Power Failure";
  }

  // Overstrain Failure: high torque and high tool wear
  if (torque > 60 && toolWear > 200) {
    return "Overstrain Failure";
  }

  // Tool Wear Failure: very high tool wear
  if (toolWear > 200) {
    return "Tool Wear Failure";
  }

  // Random Failure (catch-all for predicted failures with no clear pattern)
  return "Random Failure";
}

// ---------------------------------------------------------------------------
// Public prediction function
// ---------------------------------------------------------------------------
export type ModelType = "logistic_regression" | "knn" | "both";

export interface PredictionInput {
  airTemp: number;
  processTemp: number;
  rotationalSpeed: number;
  torque: number;
  toolWear: number;
}

export interface SingleModelResult {
  model: string;
  probability: number;
  prediction: number;
  failureType: string;
}

export interface PredictionResult {
  results: SingleModelResult[];
  bestModel: string;
  bestProbability: number;
  bestPrediction: number;
  bestFailureType: string;
}

export function predict(
  input: PredictionInput,
  modelType: ModelType = "both"
): PredictionResult {
  const rawFeatures = [
    input.airTemp,
    input.processTemp,
    input.rotationalSpeed,
    input.torque,
    input.toolWear,
  ];

  const scaledFeatures = standardize(rawFeatures);
  const results: SingleModelResult[] = [];

  if (modelType === "logistic_regression" || modelType === "both") {
    const lr = predictLogisticRegression(scaledFeatures);
    results.push({
      model: "Logistic Regression",
      probability: lr.probability,
      prediction: lr.prediction,
      failureType:
        lr.prediction === 1
          ? determineFailureType(rawFeatures)
          : "No Failure",
    });
  }

  if (modelType === "knn" || modelType === "both") {
    const knn = predictKNN(scaledFeatures);
    results.push({
      model: "K-Nearest Neighbours",
      probability: knn.probability,
      prediction: knn.prediction,
      failureType:
        knn.prediction === 1
          ? determineFailureType(rawFeatures)
          : "No Failure",
    });
  }

  // Best result = highest probability model
  const best = results.reduce((prev, curr) =>
    curr.probability > prev.probability ? curr : prev
  );

  return {
    results,
    bestModel: best.model,
    bestProbability: best.probability,
    bestPrediction: best.prediction,
    bestFailureType: best.failureType,
  };
}
