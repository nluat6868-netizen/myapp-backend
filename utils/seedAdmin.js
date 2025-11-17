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

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB()

    const adminEmail = 'nluat134@gmail.com'
    const adminPassword = 'admin123'
    const adminName = 'anhluat165'

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.name = adminName
      existingAdmin.role = 'admin'
      existingAdmin.permissions = []
      
      // Reset password - will be hashed by pre-save hook
      existingAdmin.password = adminPassword
      existingAdmin.markModified('password') // Force save to trigger pre-save hook
      
      await existingAdmin.save()
      console.log('✅ Đã cập nhật user thành admin!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🔑 Mật khẩu mới:', adminPassword)
      console.log('👤 Role:', existingAdmin.role)
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin',
        permissions: [],
      })

      console.log('✅ Đã tạo admin user mới!')
      console.log('📧 Email:', admin.email)
      console.log('🔑 Mật khẩu:', adminPassword)
      console.log('👤 Role:', admin.role)
      console.log('🆔 ID:', admin._id)
    }

    console.log('\n✅ Hoàn tất! Tài khoản admin đã sẵn sàng!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error)
    process.exit(1)
  }
}

// Run seed
seedAdmin()

