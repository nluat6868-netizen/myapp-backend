import ActivityLog from '../models/ActivityLog.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         action:
 *           type: string
 *         entityType:
 *           type: string
 *         entityId:
 *           type: string
 *         description:
 *           type: string
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/activity-logs:
 *   get:
 *     summary: Get activity logs
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Not authorized
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { limit = 50, userId, action } = req.query
  const filter = {}

  // SuperAdmin can see all logs
  if (req.user.role === 'superAdmin') {
    // SuperAdmin can filter by userId if provided
    if (userId) {
      filter.user = userId
    }
  } else if (req.user.role === 'admin') {
    // Admin can only see their own logs (not other admins)
    filter.user = req.user._id
  } else {
    // Regular users can only see their own logs
    filter.user = req.user._id
  }

  if (action) {
    filter.action = action
  }

  const logs = await ActivityLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))

  res.json(logs)
})

/**
 * @swagger
 * /api/activity-logs/stats:
 *   get:
 *     summary: Get activity statistics
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity statistics
 *       401:
 *         description: Not authorized
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  const filter = {}

  // SuperAdmin can see all stats
  if (req.user.role === 'superAdmin') {
    // No filter - see all
  } else {
    // Admin and regular users can only see their own stats
    filter.user = req.user._id
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    total: await ActivityLog.countDocuments(filter),
    today: await ActivityLog.countDocuments({
      ...filter,
      createdAt: { $gte: today },
    }),
    byAction: await ActivityLog.aggregate([
      { $match: filter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  }

  res.json(stats)
})


