import express from 'express'
import { getActivityLogs, getActivityStats } from '../controllers/activityLogController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(protect, getActivityLogs)
router.route('/stats').get(protect, getActivityStats)

export default router



