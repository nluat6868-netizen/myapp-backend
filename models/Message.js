import mongoose from 'mongoose'

const messageSchema = mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    sender: {
      type: String,
      enum: ['user', 'customer'],
      required: [true, 'Sender is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [
        {
          type: {
            type: String,
            enum: ['image', 'file', 'icon'],
          },
          url: String,
          name: String,
        },
      ],
      default: [],
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
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ user: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)

export default Message

