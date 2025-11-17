import asyncHandler from '../middleware/asyncHandler.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

// Helper function to format time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  const minutes = Math.floor(diff / 60000)
  if (minutes > 0) return `${minutes} phút trước`
  return 'Vừa xong'
}

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for a platform
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *         required: true
 *     responses:
 *       200:
 *         description: List of conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
  const { platform } = req.query
  const userId = req.user._id

  if (!platform || !['facebook', 'zalo', 'telegram'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform' })
  }

  const conversations = await Conversation.find({
    user: userId,
    platform,
  })
    .sort({ pinned: -1, unread: -1, updatedAt: -1 })
    .lean()

  // Get last message and message count for each conversation
  const conversationsWithMessages = await Promise.all(
    conversations.map(async (conv) => {
      const messages = await Message.find({ conversation: conv._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean()

      const messageCount = await Message.countDocuments({ conversation: conv._id })

      const lastMessage = messages[0] || null

      return {
        ...conv,
        id: conv._id.toString(),
        name: conv.customerName,
        avatar: conv.customerAvatar,
        lastMessage: lastMessage?.text || conv.lastMessage || '',
        messageCount,
        messages: lastMessage ? [lastMessage] : [],
        time: formatTime(conv.updatedAt || conv.createdAt),
      }
    })
  )

  res.json(conversationsWithMessages)
})

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const createConversation = asyncHandler(async (req, res) => {
  const { platform, customerName, customerAvatar, online } = req.body
  const userId = req.user._id

  if (!platform || !['facebook', 'zalo', 'telegram'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform' })
  }

  if (!customerName) {
    return res.status(400).json({ message: 'Customer name is required' })
  }

  const conversation = await Conversation.create({
    platform,
    customerName,
    customerAvatar: customerAvatar || `https://i.pravatar.cc/150?img=${Date.now()}`,
    online: online || false,
    user: userId,
  })

  res.status(201).json({
    ...conversation.toObject(),
    id: conversation._id.toString(),
  })
})

/**
 * @swagger
 * /api/messages/conversations/:id:
 *   get:
 *     summary: Get conversation with all messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const conversation = await Conversation.findOne({
    _id: id,
    user: userId,
  }).lean()

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' })
  }

  const messages = await Message.find({ conversation: id })
    .sort({ createdAt: 1 })
    .lean()

  // Mark as read
  await Conversation.findByIdAndUpdate(id, { unread: 0 })

  res.json({
    ...conversation,
    id: conversation._id.toString(),
    name: conversation.customerName,
    avatar: conversation.customerAvatar,
    messages: messages.map((msg) => ({
      ...msg,
      id: msg._id.toString(),
      timestamp: msg.createdAt,
      sender: msg.sender === 'user' ? 'me' : 'user', // Backend: user=me, customer=user. Frontend: me=me, user=customer
    })),
  })
})

/**
 * @swagger
 * /api/messages/conversations/:id:
 *   put:
 *     summary: Update conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const updateConversation = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const { pinned, online, customerName, customerAvatar } = req.body

  const conversation = await Conversation.findOne({
    _id: id,
    user: userId,
  })

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' })
  }

  if (pinned !== undefined) conversation.pinned = pinned
  if (online !== undefined) conversation.online = online
  if (customerName) conversation.customerName = customerName
  if (customerAvatar) conversation.customerAvatar = customerAvatar

  await conversation.save()

  res.json({
    ...conversation.toObject(),
    id: conversation._id.toString(),
  })
})

/**
 * @swagger
 * /api/messages/conversations/:id:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const conversation = await Conversation.findOne({
    _id: id,
    user: userId,
  })

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' })
  }

  // Delete all messages in this conversation
  await Message.deleteMany({ conversation: id })

  // Delete conversation
  await Conversation.findByIdAndDelete(id)

  res.json({ message: 'Conversation deleted' })
})

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const createMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, sender, tags, attachments } = req.body
  const userId = req.user._id

  if (!conversationId || !text || !sender) {
    return res.status(400).json({ message: 'Conversation ID, text, and sender are required' })
  }

  if (!['user', 'customer'].includes(sender)) {
    return res.status(400).json({ message: 'Invalid sender type' })
  }

  // Verify conversation belongs to user
  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: userId,
  })

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' })
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    text,
    sender,
    tags: tags || [],
    attachments: attachments || [],
    user: userId,
  })

  // Update conversation
  conversation.lastMessage = text
  if (sender === 'customer') {
    conversation.unread = (conversation.unread || 0) + 1
  }
  await conversation.save()

  res.status(201).json({
    ...message.toObject(),
    id: message._id.toString(),
    timestamp: message.createdAt,
    sender: message.sender === 'user' ? 'me' : 'user', // Convert for frontend
  })
})

/**
 * @swagger
 * /api/messages/:id:
 *   put:
 *     summary: Update message (e.g., add tags)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const updateMessage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const { tags, attachments } = req.body

  const message = await Message.findOne({
    _id: id,
    user: userId,
  })

  if (!message) {
    return res.status(404).json({ message: 'Message not found' })
  }

  if (tags !== undefined) message.tags = tags
  if (attachments !== undefined) message.attachments = attachments

  await message.save()

  res.json({
    ...message.toObject(),
    id: message._id.toString(),
    timestamp: message.createdAt,
    sender: message.sender === 'user' ? 'me' : 'user', // Convert for frontend
  })
})

/**
 * @swagger
 * /api/messages/:id:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const message = await Message.findOne({
    _id: id,
    user: userId,
  })

  if (!message) {
    return res.status(404).json({ message: 'Message not found' })
  }

  await Message.findByIdAndDelete(id)

  res.json({ message: 'Message deleted' })
})

/**
 * @swagger
 * /api/messages/stats:
 *   get:
 *     summary: Get message statistics
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
export const getMessageStats = asyncHandler(async (req, res) => {
  const { platform } = req.query
  const userId = req.user._id

  if (!platform || !['facebook', 'zalo', 'telegram'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform' })
  }

  const conversations = await Conversation.find({
    user: userId,
    platform,
  })

  let totalMessages = 0
  let closedOrders = 0

  for (const conv of conversations) {
    const messageCount = await Message.countDocuments({ conversation: conv._id })
    totalMessages += messageCount

    // Check if conversation has "Bán hàng" or "Chốt đơn" tag
    const hasOrderTag = await Message.findOne({
      conversation: conv._id,
      tags: { $in: ['Bán hàng', 'Chốt đơn'] },
    })

    if (hasOrderTag) {
      closedOrders++
    }
  }

  res.json({
    totalMessages,
    closedOrders,
    totalConversations: conversations.length,
  })
})

