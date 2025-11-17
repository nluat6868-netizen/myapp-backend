import ActivityLog from '../models/ActivityLog.js'

/**
 * Log user activity
 * @param {Object} options - Activity log options
 * @param {Object} options.user - User object
 * @param {String} options.action - Action type
 * @param {String} options.entityType - Entity type (optional)
 * @param {String} options.entityId - Entity ID (optional)
 * @param {String} options.description - Activity description
 * @param {String} options.ipAddress - IP address (optional)
 * @param {String} options.userAgent - User agent (optional)
 */
export const logActivity = async ({
  user,
  action,
  entityType = null,
  entityId = null,
  description,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await ActivityLog.create({
      user: user._id || user.id,
      action,
      entityType,
      entityId,
      description,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    // Don't throw error, just log it
    console.error('Error logging activity:', error)
  }
}

/**
 * Get client IP address from request
 */
export const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'Unknown'
  )
}

/**
 * Get user agent from request
 */
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown'
}



