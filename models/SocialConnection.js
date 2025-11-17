import mongoose from 'mongoose'

const socialConnectionSchema = mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'zalo', 'telegram'],
      unique: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
    pageId: {
      type: String,
      default: null,
    },
    pageName: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
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
socialConnectionSchema.index({ platform: 1 })

const SocialConnection = mongoose.model('SocialConnection', socialConnectionSchema)

export default SocialConnection



