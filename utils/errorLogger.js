import ErrorLog from '../models/ErrorLog.js'
import Settings from '../models/Settings.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get shop info from Settings based on user
 */
const getShopInfo = async (user) => {
  if (!user) return { shopId: null, shopName: 'Unknown' }

  try {
    const userId = user._id || user.id
    const settings = await Settings.findOne({ user: userId })
    
    if (settings) {
      return {
        shopId: settings._id,
        shopName: settings.shopName || `Shop-${userId}`,
      }
    }
    
    return { shopId: null, shopName: `User-${userId}` }
  } catch (error) {
    console.error('Error getting shop info:', error)
    return { shopId: null, shopName: 'Unknown' }
  }
}

/**
 * Write error log to file
 */
const writeLogToFile = async (shopName, logData) => {
  try {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const timeStr = now.toISOString() // Full timestamp
    
    // Sanitize shop name for file system
    const sanitizedShopName = shopName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50)
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../logs')
    await fs.mkdir(logsDir, { recursive: true })
    
    // Create shop-specific directory
    const shopLogsDir = path.join(logsDir, `shop-${sanitizedShopName}`)
    await fs.mkdir(shopLogsDir, { recursive: true })
    
    // Log file path: logs/shop-{shopName}/YYYY-MM-DD.log
    const logFilePath = path.join(shopLogsDir, `${dateStr}.log`)
    
    // Format log entry
    const logEntry = {
      timestamp: timeStr,
      level: logData.level,
      message: logData.message,
      user: logData.user ? (logData.user.name || logData.user.email || logData.user._id || logData.user.id) : null,
      shop: shopName,
      endpoint: logData.endpoint,
      method: logData.method,
      statusCode: logData.statusCode,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      metadata: logData.metadata,
      stack: logData.stack,
    }
    
    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n'
    await fs.appendFile(logFilePath, logLine, 'utf8')
  } catch (error) {
    // Don't throw error, just log it to console
    console.error('Error writing log to file:', error)
  }
}

/**
 * Log error to database and file
 * @param {Object} options - Error log options
 * @param {String} options.level - Error level (error, warning, info, critical)
 * @param {String} options.message - Error message
 * @param {String} options.stack - Error stack trace
 * @param {Object} options.user - User object (optional)
 * @param {String} options.ipAddress - IP address (optional)
 * @param {String} options.userAgent - User agent (optional)
 * @param {String} options.endpoint - API endpoint (optional)
 * @param {String} options.method - HTTP method (optional)
 * @param {Number} options.statusCode - HTTP status code (optional)
 * @param {Object} options.metadata - Additional metadata (optional)
 * @param {Object} options.shop - Shop info (optional, will be fetched if not provided)
 */
export const logError = async ({
  level = 'error',
  message,
  stack = null,
  user = null,
  ipAddress = null,
  userAgent = null,
  endpoint = null,
  method = null,
  statusCode = null,
  metadata = {},
  shop = null,
}) => {
  try {
    // Get shop info if not provided
    let shopInfo = shop
    if (!shopInfo && user) {
      shopInfo = await getShopInfo(user)
    } else if (!shopInfo) {
      shopInfo = { shopId: null, shopName: 'Unknown' }
    }

    // Save to database
    const errorLog = await ErrorLog.create({
      level,
      message,
      stack,
      user: user?._id || user?.id || null,
      shop: {
        shopId: shopInfo.shopId,
        shopName: shopInfo.shopName,
      },
      ipAddress,
      userAgent,
      endpoint,
      method,
      statusCode,
      metadata,
    })

    // Write to file log (async, don't wait)
    writeLogToFile(shopInfo.shopName, {
      level,
      message,
      stack,
      user,
      endpoint,
      method,
      statusCode,
      ipAddress,
      userAgent,
      metadata,
    }).catch((error) => {
      console.error('Error writing log to file:', error)
    })

    return errorLog
  } catch (error) {
    // Don't throw error, just log it to console
    console.error('Error logging to database:', error)
    
    // Try to write to file anyway if database fails
    try {
      const shopInfo = shop || (user ? await getShopInfo(user) : { shopId: null, shopName: 'Unknown' })
      await writeLogToFile(shopInfo.shopName, {
        level,
        message,
        stack,
        user,
        endpoint,
        method,
        statusCode,
        ipAddress,
        userAgent,
        metadata,
      })
    } catch (fileError) {
      console.error('Error writing log to file after DB failure:', fileError)
    }
  }
}


