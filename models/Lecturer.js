import mongoose from 'mongoose';
import User from './User.js';

/**
 * Lecturer extends User (discriminator) — adds fields that only
 * make sense for a lecturer account.
 */
const lecturerSchema = new mongoose.Schema({
  staffNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Lecturer = User.discriminator('lecturer', lecturerSchema);

export default Lecturer;
