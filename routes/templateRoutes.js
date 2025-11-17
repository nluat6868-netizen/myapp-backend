import express from 'express'
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.route('/').get(getTemplates).post(createTemplate)
router.route('/:id').get(getTemplateById).put(updateTemplate).delete(deleteTemplate)

export default router



