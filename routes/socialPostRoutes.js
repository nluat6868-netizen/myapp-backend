import express from 'express'
import { publishPost } from '../controllers/socialPostController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/publish').post(protect, publishPost)

export default router



