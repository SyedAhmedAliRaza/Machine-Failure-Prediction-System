import mongoose, { Document, Model } from "mongoose";

export interface User {
  id: string; // Map _id to id if needed, or use as is
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Prediction {
  id: string;
  userId: string;
  airTemp: number;
  processTemp: number;
  rotationalSpeed: number;
  torque: number;
  toolWear: number;
  failureProbability: number;
  predictedFailure: number;
  failureType: string;
  modelUsed: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Virtual for 'id' to map _id to id string easily
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const PredictionSchema = new mongoose.Schema<Prediction>({
  userId: { type: String, required: true, ref: 'User' },
  airTemp: { type: Number, required: true },
  processTemp: { type: Number, required: true },
  rotationalSpeed: { type: Number, required: true },
  torque: { type: Number, required: true },
  toolWear: { type: Number, required: true },
  failureProbability: { type: Number, required: true },
  predictedFailure: { type: Number, required: true },
  failureType: { type: String, required: true, default: "N/A" },
  modelUsed: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

PredictionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
PredictionSchema.set('toJSON', { virtuals: true });
PredictionSchema.set('toObject', { virtuals: true });

export const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>("User", UserSchema);
export const PredictionModel: Model<Prediction> = mongoose.models.Prediction || mongoose.model<Prediction>("Prediction", PredictionSchema);
