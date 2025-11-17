import express from 'express'
import {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getFAQs).post(createFAQ)
router.route('/:id').get(getFAQById).put(updateFAQ).delete(deleteFAQ)

export default router



