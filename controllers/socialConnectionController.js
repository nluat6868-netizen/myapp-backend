import SocialConnection from '../models/SocialConnection.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     SocialConnection:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         platform:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *         isConnected:
 *           type: boolean
 *         accessToken:
 *           type: string
 *         userId:
 *           type: string
 *         username:
 *           type: string
 *         pageId:
 *           type: string
 *         pageName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/social-connections:
 *   get:
 *     summary: Get all social connections
 *     tags: [Social Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of social connections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SocialConnection'
 *       401:
 *         description: Not authorized
 */
export const getSocialConnections = asyncHandler(async (req, res) => {
  const connections = await SocialConnection.find().sort({ platform: 1 })
  
  // Ensure all platforms exist
  const platforms = ['facebook', 'zalo', 'telegram']
  const existingPlatforms = connections.map((c) => c.platform)
  const missingPlatforms = platforms.filter((p) => !existingPlatforms.includes(p))
  
  // Create missing platforms
  for (const platform of missingPlatforms) {
    await SocialConnection.create({ platform, isConnected: false })
  }
  
  const allConnections = await SocialConnection.find().sort({ platform: 1 })
  res.json(allConnections)
})

/**
 * @swagger
 * /api/social-connections/{platform}:
 *   get:
 *     summary: Get social connection by platform
 *     tags: [Social Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *     responses:
 *       200:
 *         description: Social connection details
 *       404:
 *         description: Connection not found
 */
export const getSocialConnectionByPlatform = asyncHandler(async (req, res) => {
  const { platform } = req.params
  
  let connection = await SocialConnection.findOne({ platform })
  
  if (!connection) {
    connection = await SocialConnection.create({ platform, isConnected: false })
  }
  
  res.json(connection)
})

/**
 * @swagger
 * /api/social-connections/{platform}/connect:
 *   post:
 *     summary: Initiate connection to social platform
 *     tags: [Social Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *     responses:
 *       200:
 *         description: Connection URL generated
 *       400:
 *         description: Invalid platform
 */
export const connectSocialPlatform = asyncHandler(async (req, res) => {
  const { platform } = req.params
  
  if (!['facebook', 'zalo', 'telegram'].includes(platform)) {
    return res.status(400).json({ message: 'Platform không hợp lệ' })
  }
  
  // Generate OAuth URL based on platform
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  let authUrl = ''
  
  switch (platform) {
    case 'facebook':
      // Facebook OAuth URL
      const fbAppId = process.env.FACEBOOK_APP_ID || 'your-facebook-app-id'
      const fbRedirectUri = `${baseUrl}/settings?platform=facebook&action=callback`
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(fbRedirectUri)}&scope=pages_manage_posts,pages_read_engagement&response_type=code`
      break
    case 'zalo':
      // Zalo OAuth URL
      const zaloAppId = process.env.ZALO_APP_ID || 'your-zalo-app-id'
      const zaloRedirectUri = `${baseUrl}/settings?platform=zalo&action=callback`
      authUrl = `https://oauth.zalo.me/v4/oa/permission?app_id=${zaloAppId}&redirect_uri=${encodeURIComponent(zaloRedirectUri)}&state=zalo_connect`
      break
    case 'telegram':
      // Telegram Bot connection
      const telegramBotName = process.env.TELEGRAM_BOT_NAME || 'your_bot_name'
      authUrl = `https://t.me/${telegramBotName}?start=connect`
      break
    default:
      return res.status(400).json({ message: 'Platform không được hỗ trợ' })
  }
  
  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'connect_social',
    description: `${req.user.name} đã bắt đầu kết nối với ${platform}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })
  
  res.json({ authUrl, platform })
})

/**
 * @swagger
 * /api/social-connections/{platform}/callback:
 *   post:
 *     summary: Handle OAuth callback from social platform
 *     tags: [Social Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               accessToken:
 *                 type: string
 *               userId:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connection successful
 *       400:
 *         description: Invalid data
 */
export const handleSocialCallback = asyncHandler(async (req, res) => {
  const { platform } = req.params
  const { code, accessToken, userId, username, pageId, pageName } = req.body
  
  if (!['facebook', 'zalo', 'telegram'].includes(platform)) {
    return res.status(400).json({ message: 'Platform không hợp lệ' })
  }
  
  // In a real application, you would exchange the code for an access token
  // For now, we'll use the provided accessToken or code
  
  let connection = await SocialConnection.findOne({ platform })
  
  if (!connection) {
    connection = await SocialConnection.create({ platform })
  }
  
  connection.isConnected = true
  if (accessToken) connection.accessToken = accessToken
  if (userId) connection.userId = userId
  if (username) connection.username = username
  if (pageId) connection.pageId = pageId
  if (pageName) connection.pageName = pageName
  if (code) connection.metadata = { ...connection.metadata, code }
  
  await connection.save()
  
  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'connect_social',
    description: `${req.user.name} đã kết nối thành công với ${platform}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })
  
  res.json(connection)
})

/**
 * @swagger
 * /api/social-connections/{platform}/disconnect:
 *   post:
 *     summary: Disconnect from social platform
 *     tags: [Social Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *     responses:
 *       200:
 *         description: Disconnected successfully
 *       404:
 *         description: Connection not found
 */
export const disconnectSocialPlatform = asyncHandler(async (req, res) => {
  const { platform } = req.params
  
  const connection = await SocialConnection.findOne({ platform })
  
  if (!connection) {
    return res.status(404).json({ message: 'Không tìm thấy kết nối' })
  }
  
  connection.isConnected = false
  connection.accessToken = null
  connection.refreshToken = null
  connection.userId = null
  connection.username = null
  connection.pageId = null
  connection.pageName = null
  connection.expiresAt = null
  connection.metadata = {}
  
  await connection.save()
  
  // Log activity
  await logActivity({
    user: req.user._id,
    action: 'disconnect_social',
    description: `${req.user.name} đã ngắt kết nối với ${platform}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  })
  
  res.json({ message: `Đã ngắt kết nối với ${platform}`, connection })
})

