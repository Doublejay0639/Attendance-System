import { getSystemHealth } from '../services/health.service.js';

/**
 * Controller: owns the HTTP concerns (req, res, status codes).
 * It asks the service for data, then decides how to shape the response.
 * It does NOT know how health is calculated — that's the service's job.
 */
export const checkHealth = (req, res) => {
  const health = getSystemHealth();
  res.status(200).json(health);
};
