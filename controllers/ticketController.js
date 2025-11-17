import Ticket from '../models/Ticket.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Ticket ID
 *         title:
 *           type: string
 *           description: Ticket title
 *         description:
 *           type: string
 *           description: Ticket description
 *         status:
 *           type: string
 *           enum: [open, closed, pending]
 *           default: open
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         category:
 *           type: string
 *           enum: [technical, billing, account, feature, other]
 *           default: other
 *         createdBy:
 *           type: string
 *           description: User ID who created the ticket
 *         assignedTo:
 *           type: string
 *           description: User ID assigned to handle the ticket
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TicketCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         category:
 *           type: string
 *           enum: [technical, billing, account, feature, other]
 *     TicketUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, closed, pending]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         category:
 *           type: string
 *           enum: [technical, billing, account, feature, other]
 *     CommentRequest:
 *       type: object
 *       required:
 *         - comment
 *       properties:
 *         comment:
 *           type: string
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, pending]
 *         description: Filter by status
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authorized
 */
export const getTickets = asyncHandler(async (req, res) => {
  const { status, createdBy } = req.query
  const filter = {}

  // If user is not admin, only show their own tickets
  if (req.user.role !== 'admin') {
    filter.createdBy = req.user._id
  } else if (createdBy) {
    filter.createdBy = createdBy
  }

  if (status) {
    filter.status = status
  }

  const tickets = await Ticket.find(filter)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email')
    .sort({ createdAt: -1 })

  res.json(tickets)
})

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketCreateRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Not authorized
 */
export const createTicket = asyncHandler(async (req, res) => {
  const { title, description, priority, category } = req.body

  const ticket = await Ticket.create({
    title,
    description,
    priority: priority || 'medium',
    category: category || 'other',
    createdBy: req.user._id,
  })

  const populatedTicket = await Ticket.findById(ticket._id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')

  res.status(201).json(populatedTicket)
})

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
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
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Not authorized
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email')

  if (!ticket) {
    return res.status(404).json({ message: 'Không tìm thấy ticket' })
  }

  // Check if user has permission to view this ticket
  if (req.user.role !== 'admin' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Bạn không có quyền xem ticket này' })
  }

  res.json(ticket)
})

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Tickets]
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
 *             $ref: '#/components/schemas/TicketUpdateRequest'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'Không tìm thấy ticket' })
  }

  // Check permissions
  const isOwner = ticket.createdBy.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền cập nhật ticket này' })
  }

  const { title, description, status, priority, category } = req.body

  if (title) ticket.title = title
  if (description) ticket.description = description
  if (status && (isAdmin || status === 'closed')) ticket.status = status
  if (priority) ticket.priority = priority
  if (category) ticket.category = category

  await ticket.save()

  const updatedTicket = await Ticket.findById(ticket._id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email')

  res.json(updatedTicket)
})

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     tags: [Tickets]
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
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'Không tìm thấy ticket' })
  }

  // Only admin or owner can delete
  const isOwner = ticket.createdBy.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa ticket này' })
  }

  await ticket.deleteOne()

  res.json({ message: 'Ticket đã được xóa' })
})

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   post:
 *     summary: Add comment to ticket
 *     tags: [Tickets]
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
 *             $ref: '#/components/schemas/CommentRequest'
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Not authorized
 */
export const addComment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    return res.status(404).json({ message: 'Không tìm thấy ticket' })
  }

  // Check if user has permission to comment
  const isOwner = ticket.createdBy.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền bình luận trên ticket này' })
  }

  ticket.comments.push({
    user: req.user._id,
    comment: req.body.comment,
  })

  await ticket.save()

  const updatedTicket = await Ticket.findById(ticket._id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email')

  res.json(updatedTicket)
})



