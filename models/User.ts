import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  githubLogin: string;
  githubId: number;
  avatarUrl: string;
  email?: string;
  createdAt: Date;
  lastSyncedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  githubLogin: { type: String, required: true, unique: true, index: true },
  githubId: { type: Number, required: true, unique: true },
  avatarUrl: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: () => new Date() },
  lastSyncedAt: { type: Date },
});

export default (models.User as mongoose.Model<IUser>) ||
  model<IUser>("User", UserSchema);
