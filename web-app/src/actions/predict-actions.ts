"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { PredictionModel } from "@/lib/schema";
import { predict, type ModelType, type PredictionResult } from "@/lib/model";

export async function makePrediction(formData: FormData): Promise<{
  error?: string;
  result?: PredictionResult;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to make predictions." };
  }

  const airTemp = parseFloat(formData.get("airTemp") as string);
  const processTemp = parseFloat(formData.get("processTemp") as string);
  const rotationalSpeed = parseFloat(formData.get("rotationalSpeed") as string);
  const torque = parseFloat(formData.get("torque") as string);
  const toolWear = parseFloat(formData.get("toolWear") as string);
  const modelType = (formData.get("modelType") as ModelType) || "both";

  // Validate
  if (
    isNaN(airTemp) ||
    isNaN(processTemp) ||
    isNaN(rotationalSpeed) ||
    isNaN(torque) ||
    isNaN(toolWear)
  ) {
    return { error: "All fields must be valid numbers." };
  }

  // Run prediction
  const result = predict(
    { airTemp, processTemp, rotationalSpeed, torque, toolWear },
    modelType
  );

  await dbConnect();

  // Save to database
  try {
    await PredictionModel.create({
      userId: session.user.id,
      airTemp,
      processTemp,
      rotationalSpeed,
      torque,
      toolWear,
      failureProbability: result.bestProbability,
      predictedFailure: result.bestPrediction,
      failureType: result.bestFailureType,
      modelUsed: modelType === "both" ? "Both" : result.bestModel,
    });
  } catch (e) {
    console.error("Failed to save prediction:", e);
  }

  return { result };
}

export async function getPredictionHistory() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in.", predictions: [] };
  }

  await dbConnect();

  // Use .lean() to return plain JavaScript objects that can be passed to Client Components
  const rows = await PredictionModel
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Convert MongoDB _id to string for client-side serialization if necessary
  const serializedRows = rows.map((row: any) => ({
    ...row,
    id: row._id.toString(),
    _id: row._id.toString(),
  }));

  return { predictions: serializedRows };
}

export async function getPredictionStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return { total: 0, failures: 0, successRate: 100 };
  }

  await dbConnect();

  const rows = await PredictionModel
    .find({ userId: session.user.id })
    .lean();

  const total = rows.length;
  const failures = rows.filter((r: any) => r.predictedFailure === 1).length;
  const successRate = total > 0 ? ((total - failures) / total) * 100 : 100;

  return {
    total,
    failures,
    successRate: Math.round(successRate * 100) / 100,
  };
}
