import express from 'express'
import {
  getSocialConnections,
  getSocialConnectionByPlatform,
  connectSocialPlatform,
  handleSocialCallback,
  disconnectSocialPlatform,
} from '../controllers/socialConnectionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(protect, getSocialConnections)
router.route('/:platform').get(protect, getSocialConnectionByPlatform)
router.route('/:platform/connect').post(protect, connectSocialPlatform)
router.route('/:platform/callback').post(protect, handleSocialCallback)
router.route('/:platform/disconnect').post(protect, disconnectSocialPlatform)

export default router



