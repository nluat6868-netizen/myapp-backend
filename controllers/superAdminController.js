import User from '../models/User.js'
import Settings from '../models/Settings.js'
import Product from '../models/Product.js'
import ProductAttribute from '../models/ProductAttribute.js'
import Order from '../models/Order.js'
import Promotion from '../models/Promotion.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * @swagger
 * /api/super-admin/admins:
 *   get:
 *     summary: Get all admins (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all admins
 *       403:
 *         description: Not authorized
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  // Get all admins (not superAdmin)
  const admins = await User.find({ role: 'admin' })
    .select('-password')
    .sort({ createdAt: -1 })
    .populate('permissions')

  // Get settings for each admin to show shop info
  const adminsWithShopInfo = await Promise.all(
    admins.map(async (admin) => {
      const settings = await Settings.findOne({ user: admin._id })
      return {
        ...admin.toObject(),
        shopInfo: settings
          ? {
              shopName: settings.shopName || 'Chưa có tên shop',
              industry: settings.industry || 'Chưa cập nhật',
              businessType: settings.businessType || 'Chưa cập nhật',
              businessPurpose: settings.businessPurpose || 'Chưa cập nhật',
            }
          : null,
      }
    })
  )

  res.json(adminsWithShopInfo)
})

/**
 * @swagger
 * /api/super-admin/stats:
 *   get:
 *     summary: Get statistics for all admins (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics for all admins
 *       403:
 *         description: Not authorized
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('_id name email')

  const stats = await Promise.all(
    admins.map(async (admin) => {
      const settings = await Settings.findOne({ user: admin._id })
      const products = await Product.countDocuments({ user: admin._id })
      const orders = await Order.countDocuments({ user: admin._id })
      const promotions = await Promotion.countDocuments({ user: admin._id })

      return {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
        shop: settings
          ? {
              shopName: settings.shopName || 'Chưa có tên shop',
              industry: settings.industry || 'Chưa cập nhật',
              businessType: settings.businessType || 'Chưa cập nhật',
              createdAt: settings.createdAt,
            }
          : null,
        stats: {
          products,
          orders,
          promotions,
        },
      }
    })
  )

  res.json(stats)
})

/**
 * @swagger
 * /api/super-admin/industries:
 *   get:
 *     summary: Get industry report for all admins (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Industry report
 *       403:
 *         description: Not authorized
 */
export const getIndustryReport = asyncHandler(async (req, res) => {
  // Get all admins with their settings
  const admins = await User.find({ role: 'admin' }).select('_id name email')
  const settings = await Settings.find({ user: { $in: admins.map((a) => a._id) } })

  // Group by industry
  const industryStats = {}
  const businessTypeStats = {}
  const businessPurposeStats = {}

  settings.forEach((setting) => {
    const admin = admins.find((a) => a._id.toString() === setting.user.toString())

    // Industry stats
    const industry = setting.industry || 'Chưa cập nhật'
    if (!industryStats[industry]) {
      industryStats[industry] = {
        industry,
        count: 0,
        shops: [],
        businessTypes: {},
      }
    }
    industryStats[industry].count++
    industryStats[industry].shops.push({
      adminId: admin?._id,
      adminName: admin?.name || 'Unknown',
      shopName: setting.shopName || 'Chưa có tên shop',
    })

    // Business type within industry
    const businessType = setting.businessType || 'Chưa cập nhật'
    if (!industryStats[industry].businessTypes[businessType]) {
      industryStats[industry].businessTypes[businessType] = 0
    }
    industryStats[industry].businessTypes[businessType]++

    // Business type stats
    if (!businessTypeStats[businessType]) {
      businessTypeStats[businessType] = 0
    }
    businessTypeStats[businessType]++

    // Business purpose stats
    const businessPurpose = setting.businessPurpose || 'Chưa cập nhật'
    if (!businessPurposeStats[businessPurpose]) {
      businessPurposeStats[businessPurpose] = 0
    }
    businessPurposeStats[businessPurpose]++
  })

  // Convert to arrays
  const industryReport = Object.values(industryStats).map((stat) => ({
    ...stat,
    businessTypes: Object.entries(stat.businessTypes).map(([type, count]) => ({
      type,
      count,
    })),
  }))

  const businessTypeReport = Object.entries(businessTypeStats).map(([type, count]) => ({
    type,
    count,
  }))

  const businessPurposeReport = Object.entries(businessPurposeStats).map(([purpose, count]) => ({
    purpose,
    count,
  }))

  res.json({
    totalAdmins: admins.length,
    totalShops: settings.length,
    industryReport,
    businessTypeReport,
    businessPurposeReport,
  })
})

/**
 * @swagger
 * /api/super-admin/admins/:id:
 *   get:
 *     summary: Get admin details (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin details
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Admin not found
 */
export const getAdminDetails = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id).select('-password')

  if (!admin || admin.role !== 'admin') {
    res.status(404)
    throw new Error('Admin not found')
  }

  const settings = await Settings.findOne({ user: admin._id })
  const products = await Product.countDocuments({ user: admin._id })
  const orders = await Order.countDocuments({ user: admin._id })
  const promotions = await Promotion.countDocuments({ user: admin._id })

  res.json({
    admin: admin.toObject(),
    shop: settings || null,
    stats: {
      products,
      orders,
      promotions,
    },
  })
})

/**
 * @swagger
 * /api/super-admin/admins/:id:
 *   delete:
 *     summary: Delete admin (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Admin not found
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id)

  if (!admin || admin.role !== 'admin') {
    res.status(404)
    throw new Error('Admin not found')
  }

  await admin.deleteOne()
  res.json({ message: 'Admin deleted successfully' })
})

/**
 * @swagger
 * /api/super-admin/dashboard:
 *   get:
 *     summary: Get SuperAdmin dashboard statistics (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Not authorized
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const last7Days = new Date(today)
  last7Days.setDate(last7Days.getDate() - 7)
  
  const last30Days = new Date(today)
  last30Days.setDate(last30Days.getDate() - 30)
  
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // User registration statistics
  const allUsers = await User.find().select('createdAt role')
  const allAdmins = await User.find({ role: 'admin' }).select('_id name email createdAt')
  
  const newUsersToday = allUsers.filter((user) => {
    const userDate = new Date(user.createdAt)
    userDate.setHours(0, 0, 0, 0)
    return userDate.getTime() === today.getTime()
  }).length
  
  const newUsersLast7Days = allUsers.filter((user) => {
    const userDate = new Date(user.createdAt)
    return userDate >= last7Days
  }).length
  
  const newUsersLast30Days = allUsers.filter((user) => {
    const userDate = new Date(user.createdAt)
    return userDate >= last30Days
  }).length
  
  const newUsersThisMonth = allUsers.filter((user) => {
    const userDate = new Date(user.createdAt)
    return userDate >= thisMonth
  }).length
  
  const newUsersLastMonth = allUsers.filter((user) => {
    const userDate = new Date(user.createdAt)
    return userDate >= lastMonth && userDate < lastMonthEnd
  }).length

  // Revenue statistics - get all orders from all admins
  const allOrders = await Order.find().select('totalAmount createdAt user')
  
  const revenueToday = allOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)
  
  const revenueLast7Days = allOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= last7Days
    })
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)
  
  const revenueLast30Days = allOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= last30Days
    })
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)
  
  const revenueThisMonth = allOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= thisMonth
    })
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)
  
  const revenueLastMonth = allOrders
    .filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= lastMonth && orderDate < lastMonthEnd
    })
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)

  // Total statistics
  const totalUsers = allUsers.length
  const totalAdminsCount = allAdmins.length
  const totalOrders = allOrders.length
  const totalRevenue = allOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)

  // Get admins by industry
  const settings = await Settings.find({ user: { $in: allAdmins.map((a) => a._id) } })
  
  const adminsByIndustry = {}
  settings.forEach((setting) => {
    const industry = setting.industry || 'Chưa cập nhật'
    if (!adminsByIndustry[industry]) {
      adminsByIndustry[industry] = []
    }
    const admin = allAdmins.find((a) => a._id.toString() === setting.user.toString())
    if (admin) {
      adminsByIndustry[industry].push({
        adminId: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        shopName: setting.shopName || 'Chưa có tên shop',
        businessType: setting.businessType || 'Chưa cập nhật',
        businessPurpose: setting.businessPurpose || 'Chưa cập nhật',
        createdAt: setting.createdAt,
      })
    }
  })

  // Calculate stats for each admin
  const adminStatsList = await Promise.all(
    allAdmins.map(async (admin) => {
      const settings = await Settings.findOne({ user: admin._id })
      const products = await Product.countDocuments({ user: admin._id })
      const orders = await Order.find({ user: admin._id })
      const orderCount = orders.length
      const revenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.total || 0) || 0), 0)
      const promotions = await Promotion.countDocuments({ user: admin._id })

      return {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          createdAt: admin.createdAt,
        },
        shop: settings
          ? {
              shopName: settings.shopName || 'Chưa có tên shop',
              industry: settings.industry || 'Chưa cập nhật',
              businessType: settings.businessType || 'Chưa cập nhật',
              businessPurpose: settings.businessPurpose || 'Chưa cập nhật',
              createdAt: settings.createdAt,
            }
          : null,
        stats: {
          products,
          orders: orderCount,
          revenue,
          promotions,
        },
      }
    })
  )

  res.json({
    users: {
      total: totalUsers,
      newToday: newUsersToday,
      newLast7Days: newUsersLast7Days,
      newLast30Days: newUsersLast30Days,
      newThisMonth: newUsersThisMonth,
      newLastMonth: newUsersLastMonth,
    },
    revenue: {
      total: totalRevenue,
      today: revenueToday,
      last7Days: revenueLast7Days,
      last30Days: revenueLast30Days,
      thisMonth: revenueThisMonth,
      lastMonth: revenueLastMonth,
    },
    admins: {
      total: totalAdminsCount,
      byIndustry: Object.entries(adminsByIndustry).map(([industry, admins]) => ({
        industry,
        count: admins.length,
        admins,
      })),
    },
    orders: {
      total: totalOrders,
    },
    adminStats: adminStatsList,
  })
})

