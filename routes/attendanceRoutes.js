import { Router } from "express";
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { scanQrSchema } from "../schemas/attendanceSchema.js";
import { scanQr } from "../controllers/attendanceController.js";

const router = Router();

router.post('/scan', 
    protect, 
    authorize('student'), 
    validate(scanQrSchema), 
    scanQr
);


export default router;