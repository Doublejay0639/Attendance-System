import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending_face_verification, present',  'face_verification_failed'],
        default: 'pending_face_verification'
    },
    scannedAt: {
        type: Date,
        default: Date.now,
    },
    faceVerificationDeadline: {
        type: Date,
        required: true,
    },
    verifiedAt: {
        type: Date
    },
}, { timestamps: true });

attendanceSchema.index(
  { sessionId: 1, studentId: 1 },
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;