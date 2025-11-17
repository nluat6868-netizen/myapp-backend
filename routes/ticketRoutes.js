import express from 'express'
import {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
} from '../controllers/ticketController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(protect, getTickets).post(protect, createTicket)
router.route('/:id').get(protect, getTicketById).put(protect, updateTicket).delete(protect, deleteTicket)
router.route('/:id/comments').post(protect, addComment)

export default router



