import Template from '../models/Template.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated template ID
 *         name:
 *           type: string
 *           description: Template name
 *         description:
 *           type: string
 *           description: Template description
 *         templateType:
 *           type: string
 *           enum: [information, data]
 *           default: data
 *           description: Template type
 *         searchAttributes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of attribute IDs for search
 *         displayAttributes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of attribute IDs for display
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Is default template
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Template'
 *       500:
 *         description: Server error
 */
export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find({ user: req.user._id }).populate('searchAttributes displayAttributes').sort({ createdAt: -1 })
  res.json(templates)
})

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
export const getTemplateById = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ _id: req.params.id, user: req.user._id }).populate('searchAttributes displayAttributes')
  if (!template) {
    res.status(404)
    throw new Error('Template not found')
  }
  res.json(template)
})

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       500:
 *         description: Server error
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const template = await Template.create({ ...req.body, user: req.user._id })
  const populated = await Template.findById(template._id).populate('searchAttributes displayAttributes')

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo template: "${template.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(populated)
})

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('searchAttributes displayAttributes')

  if (!template) {
    res.status(404)
    throw new Error('Template not found')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_template',
    description: `${req.user.name} đã cập nhật template: "${template.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(template)
})

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Template deleted
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ _id: req.params.id, user: req.user._id })
  if (!template) {
    res.status(404)
    throw new Error('Template not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa template: "${template.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await Template.deleteOne({ _id: template._id })
  res.json({ message: 'Template deleted' })
})
