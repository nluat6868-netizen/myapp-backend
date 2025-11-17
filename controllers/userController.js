import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
export const getUsers = async (req, res) => {
  try {
    let query = {}

    // SuperAdmin can see all users
    if (req.user.role === 'superAdmin') {
      // No filter - see all users
    } else if (req.user.role === 'admin') {
      // Admin can only see users in their shop (sub-users if any, or just themselves)
      // For now, admin can only see users with same shop/user reference
      // If you have a shop model, filter by shop
      // For simplicity, admin can see all users but in practice should filter by shop
      // This might need adjustment based on your business logic
      query._id = req.user._id // Admin only sees themselves for now
      // TODO: Implement shop-based user filtering when shop structure is defined
    } else {
      // Regular users can only see themselves
      query._id = req.user._id
    }

    const users = await User.find(query).select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'admin', // Default to admin for new users
    permissions: permissions || [],
  })

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'create',
    description: `${req.user.name} đã tạo người dùng mới: ${user.name} (${user.email})`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    avatar: user.avatar,
    createdAt: user.createdAt,
  })
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.name = name || user.name
  user.email = email || user.email
  user.role = role || user.role
  user.permissions = permissions !== undefined ? permissions : user.permissions

  if (password) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
  }

  const updatedUser = await user.save()

  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'update_user',
    description: `${req.user.name} đã cập nhật người dùng: ${updatedUser.name} (${updatedUser.email})`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    permissions: updatedUser.permissions,
    avatar: updatedUser.avatar,
    updatedAt: updatedUser.updatedAt,
  })
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User removed
 *       400:
 *         description: Cannot delete your own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Prevent deleting current user
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('Cannot delete your own account')
  }

  // Log activity before deleting
  await logActivity({
    user: req.user._id,
    action: 'delete',
    description: `${req.user.name} đã xóa người dùng: ${user.name} (${user.email})`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })

  await user.deleteOne()
  res.json({ message: 'User removed' })
})
