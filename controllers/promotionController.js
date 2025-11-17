import Promotion from '../models/Promotion.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         order:
 *           type: number
 *         campaignName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed, freeship]
 *         discountPercentage:
 *           type: number
 *         discountAmount:
 *           type: number
 *         freeShip:
 *           type: boolean
 *         description:
 *           type: string
 *         voucherImage:
 *           type: string
 *         quantity:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 */
export const getPromotions = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401)
    throw new Error('Not authorized')
  }
  
  const promotions = await Promotion.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 })
  res.json(promotions)
})

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     tags: [Promotions]
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
 *         description: Promotion details
 *       404:
 *         description: Promotion not found
 */
export const getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOne({ _id: req.params.id, user: req.user._id })
  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi')
  }
  res.json(promotion)
})

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create a new promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Promotion created successfully
 */
export const createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create({ ...req.body, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo khuyến mãi "${promotion.campaignName}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(promotion)
})

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *       404:
 *         description: Promotion not found
 */
export const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_promotion',
    description: `${req.user.name} đã cập nhật khuyến mãi "${promotion.campaignName}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(promotion)
})

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion
 *     tags: [Promotions]
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
 *         description: Promotion deleted successfully
 *       404:
 *         description: Promotion not found
 */
export const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOne({ _id: req.params.id, user: req.user._id })

  if (!promotion) {
    res.status(404)
    throw new Error('Không tìm thấy khuyến mãi')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa khuyến mãi "${promotion.campaignName}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await Promotion.deleteOne({ _id: promotion._id })
  res.json({ message: 'Đã xóa khuyến mãi' })
})

