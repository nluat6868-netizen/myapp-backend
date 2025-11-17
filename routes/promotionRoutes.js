import express from 'express'
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(protect, getPromotions).post(protect, createPromotion)
router.route('/:id').get(protect, getPromotionById).put(protect, updatePromotion).delete(protect, deletePromotion)

export default router



