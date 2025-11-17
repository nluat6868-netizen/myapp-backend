import SocialConnection from '../models/SocialConnection.js'
import asyncHandler from '../middleware/asyncHandler.js'
import { logActivity, getClientIp, getUserAgent } from '../utils/activityLogger.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     SocialPost:
 *       type: object
 *       properties:
 *         platform:
 *           type: string
 *           enum: [facebook, zalo, telegram]
 *         content:
 *           type: string
 *         imageUrl:
 *           type: string
 *         link:
 *           type: string
 *         scheduledTime:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/social-posts/publish:
 *   post:
 *     summary: Publish a post to social media platform
 *     tags: [Social Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - content
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [facebook, zalo, telegram]
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post published successfully
 *       400:
 *         description: Invalid data or not connected
 *       401:
 *         description: Not authorized
 */
export const publishPost = asyncHandler(async (req, res) => {
  const { platform, content, imageUrl, link } = req.body

  if (!platform || !content) {
    return res.status(400).json({ message: 'Platform và nội dung là bắt buộc' })
  }

  // Check if platform is connected
  const connection = await SocialConnection.findOne({ platform, isConnected: true })

  if (!connection) {
    return res.status(400).json({ message: `Chưa kết nối với ${platform}. Vui lòng kết nối trước.` })
  }

  // In a real application, you would use the Facebook Graph API to post
  // For now, we'll simulate the posting
  try {
    // Simulate API call to Facebook
    // const response = await fetch(`https://graph.facebook.com/v18.0/${connection.pageId}/feed`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${connection.accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message: content,
    //     link: link || undefined,
    //   }),
    // })

    // For demo purposes, we'll just log and return success
    console.log('Publishing post to Facebook:', {
      platform,
      content,
      imageUrl,
      link,
      pageId: connection.pageId,
    })

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'publish_social_post',
      description: `${req.user.name} đã đăng bài lên ${platform}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    })

    res.json({
      message: 'Đã đăng bài thành công',
      postId: `post_${Date.now()}`,
      platform,
      publishedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    res.status(500).json({ message: 'Lỗi khi đăng bài. Vui lòng thử lại.' })
  }
})



