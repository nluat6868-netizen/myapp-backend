import mongoose from 'mongoose'

const errorLogSchema = mongoose.Schema(
  {
    level: {
      type: String,
      enum: ['error', 'warning', 'info', 'critical'],
      default: 'error',
    },
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shop: {
      shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings',
      },
      shopName: {
        type: String,
        default: '',
      },
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    endpoint: {
      type: String,
    },
    method: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
errorLogSchema.index({ createdAt: -1 })
errorLogSchema.index({ level: 1 })
errorLogSchema.index({ user: 1 })
errorLogSchema.index({ 'shop.shopId': 1 })

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema)

export default ErrorLog


