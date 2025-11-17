import mongoose from 'mongoose'

const activityLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'create_user',
        'update_user',
        'delete_user',
        'create_faq',
        'update_faq',
        'delete_faq',
        'create_attribute',
        'update_attribute',
        'delete_attribute',
        'create_product',
        'update_product',
        'delete_product',
        'create_order',
        'update_order',
        'delete_order',
        'create_promotion',
        'update_promotion',
        'delete_promotion',
        'create_template',
        'update_template',
        'delete_template',
        'create_tone',
        'update_tone',
        'delete_tone',
        'update_settings',
        'create_ticket',
        'update_ticket',
        'delete_ticket',
        'view_dashboard',
        'view_profile',
      ],
    },
    entityType: {
      type: String,
      enum: ['user', 'faq', 'attribute', 'product', 'order', 'template', 'tone', 'settings', 'ticket', 'system'],
    },
    entityId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })
activityLogSchema.index({ createdAt: -1 })

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)

export default ActivityLog


