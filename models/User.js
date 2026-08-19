import mongoose from 'mongoose';

/**
 * Base User schema — holds ONLY what every account has in common,
 * regardless of role: identity + auth fields.
 *
 * Student and Lecturer are built as Mongoose "discriminators" on top
 * of this schema (see Student.js / Lecturer.js). That means:
 *   - They physically live in ONE MongoDB collection ("users").

 */
const userOptions = {
  discriminatorKey: 'role',
  timestamps: true, // adds createdAt / updatedAt automatically
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // enforced at the DB level, across ALL roles
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default on queries — must opt in explicitly
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'lecturer'],
    },
    department: {
      type: String,
      trim: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
  },
  userOptions
);

// NOTE: We deliberately do NOT hash passwords here with a pre-save hook.
// Hashing is business logic (bcrypt + salt rounds config) and belongs in
// services/auth.service.js, per the routes -> controllers -> services
// separation we're following. The model's only job is to describe shape
// and constraints, not to perform operations.

const User = mongoose.model('User', userSchema);

export default User;
