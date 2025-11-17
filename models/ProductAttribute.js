import mongoose from 'mongoose'

const productAttributeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'file', 'textarea', 'select', 'email', 'image', 'gallery'],
      required: true,
    },
    options: {
      type: [String], // For select type
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema)

export default ProductAttribute

