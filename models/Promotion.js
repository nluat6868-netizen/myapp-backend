import mongoose from 'mongoose'

const promotionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    order: {
      type: Number,
      default: 0,
    },
    campaignName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'freeship'],
      default: 'percentage',
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    freeShip: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
    voucherImage: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Promotion = mongoose.model('Promotion', promotionSchema)

export default Promotion

