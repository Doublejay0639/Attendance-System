import mongoose from 'mongoose';

/**
 * Returns the current system health as a plain data object.
 * No knowledge of HTTP here — this could just as easily be called
 * from a CLI script or a scheduled job, not just a route.
 *
 * mongoose.connection.readyState: 0 = disconnected, 1 = connected,
 * 2 = connecting, 3 = disconnecting
 */
export const getSystemHealth = () => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'not_connected';

  return {
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  };
};
