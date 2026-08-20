import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/health
// Tells us two things at a glance: is the server up, and is the DB connected.
// mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'not_connected';

  res.status(200).json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
