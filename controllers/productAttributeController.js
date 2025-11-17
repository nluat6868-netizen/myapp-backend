import ProductAttribute from '../models/ProductAttribute.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductAttribute:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated attribute ID
 *         name:
 *           type: string
 *           description: Attribute name
 *         type:
 *           type: string
 *           enum: [text, number, file, textarea, select, email, image, gallery]
 *           description: Attribute type
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Options for select type
 *         order:
 *           type: number
 *           default: 0
 *           description: Display order
 *         required:
 *           type: boolean
 *           default: false
 *           description: Is required field
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/product-attributes:
 *   get:
 *     summary: Get all product attributes
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attributes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductAttribute'
 *       500:
 *         description: Server error
 */
export const getAttributes = asyncHandler(async (req, res) => {
  const attributes = await ProductAttribute.find({ user: req.user._id }).sort({ order: 1 })
  res.json(attributes)
})

/**
 * @swagger
 * /api/product-attributes/{id}:
 *   get:
 *     summary: Get attribute by ID
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute ID
 *     responses:
 *       200:
 *         description: Attribute information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductAttribute'
 *       404:
 *         description: Attribute not found
 *       500:
 *         description: Server error
 */
export const getAttributeById = asyncHandler(async (req, res) => {
  const attribute = await ProductAttribute.findOne({ _id: req.params.id, user: req.user._id })
  if (!attribute) {
    res.status(404)
    throw new Error('Attribute not found')
  }
  res.json(attribute)
})

/**
 * @swagger
 * /api/product-attributes:
 *   post:
 *     summary: Create a new attribute
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductAttribute'
 *     responses:
 *       201:
 *         description: Attribute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductAttribute'
 *       500:
 *         description: Server error
 */
export const createAttribute = asyncHandler(async (req, res) => {
  const attribute = await ProductAttribute.create({ ...req.body, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo thuộc tính sản phẩm: "${attribute.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(attribute)
})

/**
 * @swagger
 * /api/product-attributes/{id}:
 *   put:
 *     summary: Update attribute
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductAttribute'
 *     responses:
 *       200:
 *         description: Attribute updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductAttribute'
 *       404:
 *         description: Attribute not found
 *       500:
 *         description: Server error
 */
export const updateAttribute = asyncHandler(async (req, res) => {
  const attribute = await ProductAttribute.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!attribute) {
    res.status(404)
    throw new Error('Attribute not found')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_attribute',
    description: `${req.user.name} đã cập nhật thuộc tính sản phẩm: "${attribute.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(attribute)
})

/**
 * @swagger
 * /api/product-attributes/{id}:
 *   delete:
 *     summary: Delete attribute
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute ID
 *     responses:
 *       200:
 *         description: Attribute deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attribute deleted
 *       404:
 *         description: Attribute not found
 *       500:
 *         description: Server error
 */
export const deleteAttribute = asyncHandler(async (req, res) => {
  const attribute = await ProductAttribute.findOne({ _id: req.params.id, user: req.user._id })

  if (!attribute) {
    res.status(404)
    throw new Error('Attribute not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa thuộc tính sản phẩm: "${attribute.name}"`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await ProductAttribute.deleteOne({ _id: attribute._id })
  res.json({ message: 'Attribute deleted' })
})

/**
 * @swagger
 * /api/product-attributes/order:
 *   put:
 *     summary: Update attribute order
 *     tags: [Product Attributes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attributes
 *             properties:
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Attribute order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductAttribute'
 *       500:
 *         description: Server error
 */
export const updateAttributeOrder = asyncHandler(async (req, res) => {
  const { attributes } = req.body
  const updatePromises = attributes.map((attr, index) =>
    ProductAttribute.findOneAndUpdate(
      { _id: attr._id || attr.id, user: req.user._id },
      { order: index },
      { new: true }
    )
  )
  await Promise.all(updatePromises)
  const updatedAttributes = await ProductAttribute.find({ user: req.user._id }).sort({ order: 1 })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_attribute',
    description: `${req.user.name} đã sắp xếp lại thứ tự thuộc tính sản phẩm`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(updatedAttributes)
})
