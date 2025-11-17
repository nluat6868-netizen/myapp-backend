import FAQ from '../models/FAQ.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     FAQ:
 *       type: object
 *       required:
 *         - question
 *         - answer
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated FAQ ID
 *         question:
 *           type: string
 *           description: FAQ question
 *         answer:
 *           type: string
 *           description: FAQ answer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FAQ'
 *       500:
 *         description: Server error
 */
export const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(faqs)
})

/**
 * @swagger
 * /api/faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQ'
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export const getFAQById = asyncHandler(async (req, res) => {
  const faq = await FAQ.findOne({ _id: req.params.id, user: req.user._id })
  if (!faq) {
    res.status(404)
    throw new Error('FAQ not found')
  }
  res.json(faq)
})

/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQ'
 *       500:
 *         description: Server error
 */
export const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create({ ...req.body, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo FAQ: "${faq.question.substring(0, 50)}${faq.question.length > 50 ? '...' : ''}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(faq)
})

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Update FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQ'
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!faq) {
    res.status(404)
    throw new Error('FAQ not found')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_faq',
    description: `${req.user.name} đã cập nhật FAQ: "${faq.question.substring(0, 50)}${faq.question.length > 50 ? '...' : ''}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(faq)
})

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Delete FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FAQ deleted
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findOne({ _id: req.params.id, user: req.user._id })

  if (!faq) {
    res.status(404)
    throw new Error('FAQ not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa FAQ: "${faq.question.substring(0, 50)}${faq.question.length > 50 ? '...' : ''}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await FAQ.deleteOne({ _id: faq._id })
  res.json({ message: 'FAQ deleted' })
})
