import express from 'express'
import {
  getErrorLogs,
  getErrorLogById,
  getErrorLogStats,
  deleteErrorLog,
} from '../controllers/errorLogController.js'
import { protect, authorize, hasPermission } from '../middleware/auth.js'

const router = express.Router()

// Error logs should be accessible by admin or users with 'error-logs' permission
router.route('/').get(protect, hasPermission('error-logs'), getErrorLogs)
router.route('/stats').get(protect, hasPermission('error-logs'), getErrorLogStats)
router.route('/:id').get(protect, hasPermission('error-logs'), getErrorLogById).delete(protect, hasPermission('error-logs'), deleteErrorLog)

export default router

