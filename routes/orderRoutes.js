import express from 'express'
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  deleteOrders,
} from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getOrders).post(createOrder)
router.route('/bulk-delete').post(deleteOrders)
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder)

export default router



