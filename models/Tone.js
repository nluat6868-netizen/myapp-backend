import mongoose from 'mongoose'

const toneSchema = mongoose.Schema(
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
    style: {
      type: [String],
      default: [],
    },
    staffMembers: [
      {
        name: String,
        toneId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tone',
        },
      },
    ],
    isPreset: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Tone = mongoose.model('Tone', toneSchema)

export default Tone

