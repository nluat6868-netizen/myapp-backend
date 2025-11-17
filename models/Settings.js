import mongoose from 'mongoose'

const settingsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true, // Mỗi user chỉ có 1 settings
    },
    shopName: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    businessType: {
      type: String,
      default: '',
    },
    businessPurpose: {
      type: String,
      enum: ['Bán hàng', 'Tra cứu thông tin', 'Đặt lịch'],
      default: 'Bán hàng',
    },
    taxCode: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Get settings for a specific user
settingsSchema.statics.getSettings = async function (userId) {
  let settings = await this.findOne({ user: userId })
  if (!settings) {
    settings = await this.create({ user: userId })
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)

export default Settings

