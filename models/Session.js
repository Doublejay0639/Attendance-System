import mongoose from 'mongoose';

/**
 * Session — one class period a lecturer opens for attendance.
 */
const sessionSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // refs the BASE model, since Lecturer shares the users collection
      required: true,
    },
    // Snapshot of the lecturer's name AT THE TIME the session was
    // created, not a live lookup. A session is a
    // historical record. if
    // the lecturer's profile name changes later, old sessions should
    // keep showing what was true when they happened
    lecturerName: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {  //how long the whole class period
      type: Number, // minutes
      required: true,
    },
    qrPayload: {
      type: String, // AES-encrypted — set by the QR generation service
    },
    expiryTimestamp: {
      type: Date, // when the CURRENT qrPayload expires
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    requireFaceVerification: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;