import Product from '../models/Product.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - attributes
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated product ID
 *         attributes:
 *           type: object
 *           additionalProperties: true
 *           description: Product attributes data (dynamic based on attribute definitions)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *         totalPages:
 *           type: number
 *         currentPage:
 *           type: number
 *         total:
 *           type: number
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *       500:
 *         description: Server error
 */
export const getProducts = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401)
    throw new Error('Not authorized')
  }
  
  const { page = 1, limit = 8 } = req.query
  const skip = (page - 1) * limit
  const products = await Product.find({ user: req.user._id }).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
  const total = await Product.countDocuments({ user: req.user._id })
  res.json({
    products,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total,
  })
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user._id })
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json(product)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo sản phẩm mới`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_product',
    description: `${req.user.name} đã cập nhật sản phẩm`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user._id })

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa sản phẩm`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await Product.deleteOne({ _id: product._id })
  res.json({ message: 'Product deleted' })
})
