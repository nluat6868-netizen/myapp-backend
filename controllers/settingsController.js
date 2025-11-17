import Settings from '../models/Settings.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated settings ID
 *         shopName:
 *           type: string
 *           description: Shop name
 *         address:
 *           type: string
 *           description: Shop address
 *         phone:
 *           type: string
 *           description: Shop phone
 *         email:
 *           type: string
 *           format: email
 *           description: Shop email
 *         website:
 *           type: string
 *           description: Shop website
 *         industry:
 *           type: string
 *           description: Industry type
 *         businessType:
 *           type: string
 *           description: Business type
 *         businessPurpose:
 *           type: string
 *           enum: [Bán hàng, Tra cứu thông tin, Đặt lịch]
 *           default: Bán hàng
 *           description: Business purpose
 *         taxCode:
 *           type: string
 *           description: Tax code
 *         description:
 *           type: string
 *           description: Shop description
 *         avatar:
 *           type: string
 *           nullable: true
 *           description: Shop avatar URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       500:
 *         description: Server error
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings(req.user._id)
  res.json(settings)
})

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       500:
 *         description: Server error
 */
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ user: req.user._id })
  if (settings) {
    Object.assign(settings, req.body)
    await settings.save()
  } else {
    settings = await Settings.create({ ...req.body, user: req.user._id })
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_settings',
    description: `${req.user.name} đã cập nhật cài đặt hệ thống`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(settings)
})
