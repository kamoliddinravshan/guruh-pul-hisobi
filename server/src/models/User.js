import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    avatarUrl: { type: String, trim: true },
    providers: {
      googleId: { type: String, unique: true, sparse: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
