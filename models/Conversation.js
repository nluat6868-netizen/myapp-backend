import mongoose from 'mongoose'

const conversationSchema = mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['facebook', 'zalo', 'telegram'],
      required: [true, 'Platform is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerAvatar: {
      type: String,
      default: null,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    unread: {
      type: Number,
      default: 0,
    },
    online: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
conversationSchema.index({ user: 1, platform: 1, createdAt: -1 })
conversationSchema.index({ user: 1, platform: 1, pinned: -1, unread: -1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation

