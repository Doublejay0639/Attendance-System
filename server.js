import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';


// dotenv.config();

const app = express();

// --- Global middleware ---
app.use(helmet());               // sets safe HTTP headers
app.use(cors());                 // allows the frontend (different origin) to call this API
app.use(express.json());         // parses incoming JSON request bodies into req.body


app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);


// --- 404 handler ---
// If nothing above matched, the route doesn't exist.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Central error handler ---
// Any route that calls next(err) — or throws inside an async handler
// wrapped in our asyncHandler util (we'll add that in Phase 1) — ends up here.
app.use((err, req, res, next) => {
  console.error(err.stack);

  // MongoDB duplicate key error (e.g. email, matricNo, staffNo already taken).
  // This is NOT an AppError we threw ourselves — it comes straight from
  // the driver, so we translate it into a clean 409 response here.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already in use` });
  }


  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
