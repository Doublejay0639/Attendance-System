import mongoose from 'mongoose';
import User from './User.js';

/**
 * Student extends User (discriminator) — adds everything
 * that ONLY applies to students. A Lecturer document will never
 * have these fields at all, not even as null.
 */
const studentSchema = new mongoose.Schema({
  matricNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  faceEmbedding: {
    type: [Number], // 128-dimensional embedding, per PRD 7.2
    select: false,  // excluded from API responses by default (PRD section 8, Privacy)
    default: undefined,
  },
  faceEnrolled: {
    type: Boolean,
    default: false,
  },
  enrollmentDate: {
    type: Date,
  },
  enrollmentImageCount: {
    type: Number,
    default: 0,
  },
});


// User.discriminator(name, schema)
const Student = User.discriminator('student', studentSchema);

export default Student;
