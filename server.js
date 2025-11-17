import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import connectDB from './config/database.js'
import swaggerSpec from './config/swagger.js'
import errorHandler from './middleware/errorHandler.js'

// Load env vars
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import faqRoutes from './routes/faqRoutes.js'
import productAttributeRoutes from './routes/productAttributeRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import toneRoutes from './routes/toneRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import activityLogRoutes from './routes/activityLogRoutes.js'
import socialConnectionRoutes from './routes/socialConnectionRoutes.js'
import socialPostRoutes from './routes/socialPostRoutes.js'
import errorLogRoutes from './routes/errorLogRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'
import superAdminRoutes from './routes/superAdminRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/product-attributes', productAttributeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/tones', toneRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/activity-logs', activityLogRoutes)
app.use('/api/social-connections', socialConnectionRoutes)
app.use('/api/social-posts', socialPostRoutes)
app.use('/api/error-logs', errorLogRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/messages', messageRoutes)

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'My App API Documentation',
}))

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint - API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Backend API Server is running
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 endpoints:
 *                   type: object
 *                 swagger:
 *                   type: string
 *                   example: /api-docs
 */
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      faqs: '/api/faqs',
      productAttributes: '/api/product-attributes',
      products: '/api/products',
        orders: '/api/orders',
        promotions: '/api/promotions',
        templates: '/api/templates',
        tones: '/api/tones',
        settings: '/api/settings',
        tickets: '/api/tickets',
        activityLogs: '/api/activity-logs',
        socialConnections: '/api/social-connections',
    },
    swagger: '/api-docs'
  })
})

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Server health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() })
})

// Error handling middleware (must be the last middleware)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

