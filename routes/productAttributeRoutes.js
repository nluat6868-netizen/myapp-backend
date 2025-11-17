import express from 'express'
import {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  updateAttributeOrder,
} from '../controllers/productAttributeController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getAttributes).post(createAttribute)
router.route('/order').put(updateAttributeOrder)
router.route('/:id').get(getAttributeById).put(updateAttribute).delete(deleteAttribute)

export default router



