import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import connectDB from '../config/database.js'

// Get current directory (ESM way)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '../.env') })

const seedSuperAdmin = async () => {
  try {
    // Connect to database
    await connectDB()

    const superAdminEmail = 'superadmin@example.com'
    const superAdminPassword = 'superadmin123'
    const superAdminName = 'Super Admin'

    // Check if superAdmin already exists
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail })

    if (existingSuperAdmin) {
      // Update existing user to superAdmin
      existingSuperAdmin.name = superAdminName
      existingSuperAdmin.role = 'superAdmin'
      existingSuperAdmin.permissions = []

      // Reset password - will be hashed by pre-save hook
      existingSuperAdmin.password = superAdminPassword
      existingSuperAdmin.markModified('password') // Force save to trigger pre-save hook

      await existingSuperAdmin.save()
      console.log('✅ Đã cập nhật user thành SuperAdmin!')
      console.log('📧 Email:', existingSuperAdmin.email)
      console.log('🔑 Mật khẩu mới:', superAdminPassword)
      console.log('👤 Role:', existingSuperAdmin.role)
    } else {
      // Create new superAdmin user
      const superAdmin = await User.create({
        name: superAdminName,
        email: superAdminEmail,
        password: superAdminPassword, // Will be hashed by pre-save hook
        role: 'superAdmin',
        permissions: [],
      })

      console.log('✅ Đã tạo SuperAdmin user mới!')
      console.log('📧 Email:', superAdmin.email)
      console.log('🔑 Mật khẩu:', superAdminPassword)
      console.log('👤 Role:', superAdmin.role)
      console.log('🆔 ID:', superAdmin._id)
    }

    console.log('\n✅ Hoàn tất! Tài khoản SuperAdmin đã sẵn sàng!')
    console.log('⚠️  Lưu ý: Hãy đổi mật khẩu sau khi đăng nhập!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi khi tạo SuperAdmin user:', error)
    process.exit(1)
  }
}

// Run seed
seedSuperAdmin()

