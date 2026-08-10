import mongoose, { Schema, models, model } from "mongoose";

export interface IVisibleStats {
  commits: boolean;
  prsOpened: boolean;
  prsMerged: boolean;
  issuesClosed: boolean;
  currentStreak: boolean;
}

export interface IPreferences {
  githubLogin: string;
  visibleStats: IVisibleStats;
  updatedAt: Date;
}

const PreferencesSchema = new Schema<IPreferences>({
  githubLogin: { type: String, required: true, unique: true, index: true },
  visibleStats: {
    commits: { type: Boolean, default: true },
    prsOpened: { type: Boolean, default: true },
    prsMerged: { type: Boolean, default: true },
    issuesClosed: { type: Boolean, default: true },
    currentStreak: { type: Boolean, default: true },
  },
  updatedAt: { type: Date, default: () => new Date() },
});

export default (models.Preferences as mongoose.Model<IPreferences>) ||
  model<IPreferences>("Preferences", PreferencesSchema);
