import mongoose from 'mongoose'

const templateSchema = mongoose.Schema(
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
    description: {
      type: String,
    },
    templateType: {
      type: String,
      enum: ['information', 'data'],
      default: 'data',
    },
    searchAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductAttribute',
      },
    ],
    displayAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductAttribute',
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Template = mongoose.model('Template', templateSchema)

export default Template

