import ErrorLog from '../models/ErrorLog.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         level:
 *           type: string
 *           enum: [error, warning, info, critical]
 *         message:
 *           type: string
 *         stack:
 *           type: string
 *         user:
 *           type: object
 *         ipAddress:
 *           type: string
 *         endpoint:
 *           type: string
 *         method:
 *           type: string
 *         statusCode:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/error-logs:
 *   get:
 *     summary: Get all error logs
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warning, info, critical]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of error logs
 *       401:
 *         description: Not authorized
 */
export const getErrorLogs = asyncHandler(async (req, res) => {
  const { level, limit = 50, page = 1 } = req.query
  const filter = {}

  // Filter by user/admin - only show logs for this admin's shop
  // SuperAdmin can see all logs
  if (req.user.role !== 'superAdmin') {
    // For admin, filter by shop
    if (req.user.role === 'admin') {
      filter['shop.shopId'] = req.user._id
    } else {
      // For regular users, filter by user
      filter.user = req.user._id
    }
  }

  if (level) {
    filter.level = level
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const logs = await ErrorLog.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

  const total = await ErrorLog.countDocuments(filter)

  res.json({
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

/**
 * @swagger
 * /api/error-logs/{id}:
 *   get:
 *     summary: Get error log by ID
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Error log details
 *       404:
 *         description: Log not found
 */
export const getErrorLogById = asyncHandler(async (req, res) => {
  const log = await ErrorLog.findById(req.params.id).populate('user', 'name email')

  if (!log) {
    return res.status(404).json({ message: 'Không tìm thấy log' })
  }

  res.json(log)
})

/**
 * @swagger
 * /api/error-logs/stats:
 *   get:
 *     summary: Get error log statistics
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Error log statistics
 */
export const getErrorLogStats = asyncHandler(async (req, res) => {
  const filter = {}

  // Filter by user/admin - only show stats for this admin's shop
  // SuperAdmin can see all stats
  if (req.user.role !== 'superAdmin') {
    // For admin, filter by shop
    if (req.user.role === 'admin') {
      filter['shop.shopId'] = req.user._id
    } else {
      // For regular users, filter by user
      filter.user = req.user._id
    }
  }

  const total = await ErrorLog.countDocuments(filter)
  const critical = await ErrorLog.countDocuments({ ...filter, level: 'critical' })
  const errors = await ErrorLog.countDocuments({ ...filter, level: 'error' })
  const warnings = await ErrorLog.countDocuments({ ...filter, level: 'warning' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayErrors = await ErrorLog.countDocuments({
    ...filter,
    createdAt: { $gte: today },
  })

  res.json({
    total,
    critical,
    errors,
    warnings,
    today: todayErrors,
  })
})

/**
 * @swagger
 * /api/error-logs/{id}:
 *   delete:
 *     summary: Delete error log
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log deleted successfully
 *       404:
 *         description: Log not found
 */
export const deleteErrorLog = asyncHandler(async (req, res) => {
  const log = await ErrorLog.findById(req.params.id)

  if (!log) {
    return res.status(404).json({ message: 'Không tìm thấy log' })
  }

  await ErrorLog.deleteOne({ _id: log._id })
  res.json({ message: 'Đã xóa log' })
})


