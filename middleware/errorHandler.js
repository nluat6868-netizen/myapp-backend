/**
 * Error handling middleware
 * This should be the last middleware in the chain
 */
import { logError } from '../utils/errorLogger.js'
import { getClientIp, getUserAgent } from '../utils/activityLogger.js'

const errorHandler = async (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for debugging
  console.error(err)

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found'
    statusCode = 404
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered'
    statusCode = 400
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message).join(', ')
    statusCode = 400
  }

  // Determine error level
  let level = 'error'
  if (statusCode >= 500) {
    level = 'critical'
  } else if (statusCode >= 400) {
    level = 'error'
  } else {
    level = 'warning'
  }

  // Log error to database (only for server errors or important errors)
  if (statusCode >= 500 || level === 'critical') {
    await logError({
      level,
      message: message || err.message || 'Unknown error',
      stack: err.stack,
      user: req.user || null,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      endpoint: req.originalUrl || req.url,
      method: req.method,
      statusCode,
      metadata: {
        name: err.name,
        code: err.code,
        ...(err.keyValue && { keyValue: err.keyValue }),
      },
    })
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorHandler

