import express from 'express'
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessageStats,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/conversations').get(protect, getConversations).post(protect, createConversation)
router
  .route('/conversations/:id')
  .get(protect, getConversation)
  .put(protect, updateConversation)
  .delete(protect, deleteConversation)

router.route('/').post(protect, createMessage)
router.route('/:id').put(protect, updateMessage).delete(protect, deleteMessage)

router.route('/stats').get(protect, getMessageStats)

export default router

