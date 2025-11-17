import express from 'express'
import {
  getTones,
  getToneById,
  createTone,
  updateTone,
  deleteTone,
} from '../controllers/toneController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getTones).post(createTone)
router.route('/:id').get(getToneById).put(updateTone).delete(deleteTone)

export default router



