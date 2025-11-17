import express from 'express'
import {
  getAllAdmins,
  getAdminStats,
  getIndustryReport,
  getAdminDetails,
  deleteAdmin,
  getDashboardStats,
} from '../controllers/superAdminController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// All routes require superAdmin role
router.use(protect)
router.use(authorize('superAdmin'))

router.get('/dashboard', getDashboardStats)
router.get('/admins', getAllAdmins)
router.get('/stats', getAdminStats)
router.get('/industries', getIndustryReport)
router.get('/admins/:id', getAdminDetails)
router.delete('/admins/:id', deleteAdmin)

export default router

