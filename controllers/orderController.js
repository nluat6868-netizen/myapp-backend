import Order from '../models/Order.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderNumber
 *         - customerName
 *         - customerEmail
 *         - customerPhone
 *         - total
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated order ID
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *         customerName:
 *           type: string
 *           description: Customer name
 *         customerEmail:
 *           type: string
 *           format: email
 *           description: Customer email
 *         customerPhone:
 *           type: string
 *           description: Customer phone
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         total:
 *           type: number
 *           description: Total amount
 *         status:
 *           type: string
 *           enum: [Chờ, Đang xử lý, Đã vận chuyển, Hủy bỏ]
 *           default: Chờ
 *         shippingAddress:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderListResponse:
 *       type: object
 *       properties:
 *         orders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *         totalPages:
 *           type: number
 *         currentPage:
 *           type: number
 *         total:
 *           type: number
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with pagination and filters
 *     tags: [Orders]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Chờ, Đang xử lý, Đã vận chuyển, Hủy bỏ, all]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number, customer name, or email
 *     responses:
 *       200:
 *         description: List of orders with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       500:
 *         description: Server error
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 8, status, search } = req.query
  const skip = (page - 1) * limit
  const query = { user: req.user._id }
  
  if (status && status !== 'all') {
    query.status = status
  }
  
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
    ]
  }
  
  const orders = await Order.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
  const total = await Order.countDocuments(query)
    
  res.json({
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total,
  })
})

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  res.json(order)
})

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerEmail
 *               - customerPhone
 *               - total
 *             properties:
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *                 format: email
 *               customerPhone:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               total:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Chờ, Đang xử lý, Đã vận chuyển, Hủy bỏ]
 *               shippingAddress:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
export const createOrder = asyncHandler(async (req, res) => {
  const orderNumber = `ORD-${Date.now()}`
  const order = await Order.create({ ...req.body, orderNumber, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo đơn hàng: ${orderNumber}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json(order)
})

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const updateOrder = asyncHandler(async (req, res) => {
  const oldOrder = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!oldOrder) {
    res.status(404)
    throw new Error('Order not found')
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  // Log activity
  const statusChange = req.body.status && req.body.status !== oldOrder.status
    ? ` (trạng thái: ${oldOrder.status} → ${req.body.status})`
    : ''
  await logActivity({
    user: req.user._id,
    action: 'update_order',
    description: `${req.user.name} đã cập nhật đơn hàng: ${order.orderNumber}${statusChange}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json(order)
})

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order deleted
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa đơn hàng: ${order.orderNumber}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await Order.deleteOne({ _id: order._id })
  res.json({ message: 'Order deleted' })
})

/**
 * @swagger
 * /api/orders/bulk-delete:
 *   post:
 *     summary: Delete multiple orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of order IDs to delete
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Orders deleted
 *       500:
 *         description: Server error
 */
export const deleteOrders = asyncHandler(async (req, res) => {
  const { ids } = req.body
  const orders = await Order.find({ _id: { $in: ids }, user: req.user._id })
  const orderNumbers = orders.map((o) => o.orderNumber).join(', ')

  await Order.deleteMany({ _id: { $in: ids }, user: req.user._id })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa ${ids.length} đơn hàng: ${orderNumbers}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json({ message: 'Orders deleted' })
})
