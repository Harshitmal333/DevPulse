import mongoose, { Schema, models, model } from "mongoose";
import type { GithubStatsSummary } from "@/lib/github";

export interface IStats {
  githubLogin: string;
  summary: GithubStatsSummary;
  updatedAt: Date;
}

const StatsSchema = new Schema<IStats>({
  githubLogin: { type: String, required: true, unique: true, index: true },
  summary: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: () => new Date() },
});

export default (models.Stats as mongoose.Model<IStats>) ||
  model<IStats>("Stats", StatsSchema);
