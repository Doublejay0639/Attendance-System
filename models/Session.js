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
    // created
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {  //how long the whole class period
      type: Number, // minutes
      required: true,
    },
     // How long students can scan QR codes, for example: 15 minutes.
    attendanceWindowMinutes: {
      type: Number,
      required: true,
    },

    // Exact time the attendance window closes.
    attendanceClosesAt: {
      type: Date,
      required: true,
    },
    // Hash of only the QR currently displayed.
    // `select: false` prevents it appearing in normal queries.
    qrTokenHash: {
      type: String,
      select: false,
    },
    qrExpiresAt: {
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