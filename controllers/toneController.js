import Tone from '../models/Tone.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Tone:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated tone ID
 *         name:
 *           type: string
 *           description: Tone name
 *         description:
 *           type: string
 *           description: Tone description
 *         style:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of style names
 *         staffMembers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               toneId:
 *                 type: string
 *           description: Array of staff members
 *         isPreset:
 *           type: boolean
 *           default: false
 *           description: Is preset tone
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tones:
 *   get:
 *     summary: Get all tones
 *     tags: [Tones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tone'
 *       500:
 *         description: Server error
 */
export const getTones = asyncHandler(async (req, res) => {
  const tones = await Tone.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(tones)
})

/**
 * @swagger
 * /api/tones/{id}:
 *   get:
 *     summary: Get tone by ID
 *     tags: [Tones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tone ID
 *     responses:
 *       200:
 *         description: Tone information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tone'
 *       404:
 *         description: Tone not found
 *       500:
 *         description: Server error
 */
export const getToneById = asyncHandler(async (req, res) => {
  const tone = await Tone.findOne({ _id: req.params.id, user: req.user._id })
  if (!tone) {
    res.status(404)
    throw new Error('Tone not found')
  }
  res.json(tone)
})

/**
 * @swagger
 * /api/tones:
 *   post:
 *     summary: Create a new tone
 *     tags: [Tones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tone'
 *     responses:
 *       201:
 *         description: Tone created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tone'
 *       500:
 *         description: Server error
 */
export const createTone = asyncHandler(async (req, res) => {
  const tone = await Tone.create({ ...req.body, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo tone AI: "${tone.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(tone)
})

/**
 * @swagger
 * /api/tones/{id}:
 *   put:
 *     summary: Update tone
 *     tags: [Tones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tone'
 *     responses:
 *       200:
 *         description: Tone updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tone'
 *       404:
 *         description: Tone not found
 *       500:
 *         description: Server error
 */
export const updateTone = asyncHandler(async (req, res) => {
  const tone = await Tone.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!tone) {
    res.status(404)
    throw new Error('Tone not found')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_tone',
    description: `${req.user.name} đã cập nhật tone AI: "${tone.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(tone)
})

/**
 * @swagger
 * /api/tones/{id}:
 *   delete:
 *     summary: Delete tone
 *     tags: [Tones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tone ID
 *     responses:
 *       200:
 *         description: Tone deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tone deleted
 *       404:
 *         description: Tone not found
 *       500:
 *         description: Server error
 */
export const deleteTone = asyncHandler(async (req, res) => {
  const tone = await Tone.findOne({ _id: req.params.id, user: req.user._id })
  if (!tone) {
    res.status(404)
    throw new Error('Tone not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa tone AI: "${tone.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await Tone.deleteOne({ _id: tone._id })
  res.json({ message: 'Tone deleted' })
})
