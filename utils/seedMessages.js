import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import connectDB from '../config/database.js'

// Get current directory (ESM way)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '../.env') })

const seedMessages = async () => {
  try {
    // Connect to database
    await connectDB()

    // Get first admin user
    const admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      console.log('❌ Không tìm thấy admin user. Vui lòng tạo admin trước.')
      process.exit(1)
    }

    // Dữ liệu riêng biệt cho từng platform
    const platformData = {
      facebook: [
        {
          customerName: 'Nguyễn Văn A',
          lastMessage: 'Chào shop, em muốn hỏi về sản phẩm',
          pinned: true,
          unread: 2,
          online: true,
          messages: [
            { text: 'Chào shop, em muốn hỏi về sản phẩm', sender: 'customer', hoursAgo: 2 },
            { text: 'Sản phẩm này còn hàng không ạ?', sender: 'customer', hoursAgo: 2 },
            { text: 'Chào bạn! Sản phẩm vẫn còn hàng. Bạn muốn đặt bao nhiêu?', sender: 'user', hoursAgo: 1 },
          ],
        },
        {
          customerName: 'Trần Thị B',
          lastMessage: 'Đơn hàng của em đã giao chưa?',
          pinned: false,
          unread: 1,
          online: false,
          messages: [
            { text: 'Đơn hàng của em đã giao chưa?', sender: 'customer', hoursAgo: 5 },
            { text: 'Để em kiểm tra đơn hàng của chị nhé. Mã đơn hàng là gì ạ?', sender: 'user', hoursAgo: 4 },
          ],
        },
        {
          customerName: 'Lê Văn C',
          lastMessage: 'Cảm ơn shop nhiều',
          pinned: false,
          unread: 0,
          online: true,
          messages: [
            { text: 'Cảm ơn shop nhiều', sender: 'customer', hoursAgo: 8 },
            { text: 'Sản phẩm rất đẹp, em rất hài lòng', sender: 'customer', hoursAgo: 8 },
            { text: 'Cảm ơn bạn đã tin tưởng shop! Nếu cần gì thêm cứ liên hệ nhé.', sender: 'user', hoursAgo: 7 },
          ],
        },
        {
          customerName: 'Phạm Thị D',
          lastMessage: 'Em muốn đổi size',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'Em muốn đổi size', sender: 'customer', hoursAgo: 12 },
            { text: 'Bạn muốn đổi size nào? Em sẽ hỗ trợ bạn đổi hàng nhé.', sender: 'user', hoursAgo: 11 },
          ],
        },
        {
          customerName: 'Hoàng Văn E',
          lastMessage: 'Shop có ship nhanh không?',
          pinned: false,
          unread: 3,
          online: true,
          messages: [
            { text: 'Shop có ship nhanh không?', sender: 'customer', hoursAgo: 15 },
            { text: 'Em cần gấp trong ngày mai', sender: 'customer', hoursAgo: 15 },
            { text: 'Shop có thể ship nhanh trong 2-3 ngày. Bạn có muốn đặt không?', sender: 'customer', hoursAgo: 14 },
            { text: 'Shop có dịch vụ ship nhanh trong 24h với phí phụ thu. Bạn có muốn dùng dịch vụ này không?', sender: 'user', hoursAgo: 13 },
          ],
        },
      ],
      zalo: [
        {
          customerName: 'Văn Khánh (nhà xe)',
          lastMessage: 'Khách xù kèo e rồi',
          pinned: true,
          unread: 2,
          online: false,
          messages: [
            { text: 'Khách xù kèo e rồi', sender: 'customer', hoursAgo: 22 },
            { text: 'Anh ơi, khách hàng vừa hủy đơn hàng rồi. Em cần xử lý như thế nào ạ?', sender: 'customer', hoursAgo: 22 },
            { text: 'Để tôi kiểm tra và liên hệ lại với khách hàng nhé. Bạn có thể gửi thông tin đơn hàng cho tôi không?', sender: 'user', hoursAgo: 21 },
          ],
        },
        {
          customerName: 'Mozzi Huỳnh Văn Bánh',
          lastMessage: '1 đứa nữa',
          pinned: false,
          unread: 0,
          online: true,
          messages: [
            { text: '1 đứa nữa', sender: 'customer', hoursAgo: 11 },
            { text: 'Anh ơi, có thêm 1 đơn hàng mới nữa. Em đã xác nhận với khách hàng rồi.', sender: 'customer', hoursAgo: 11 },
            { text: 'Cảm ơn bạn! Tôi sẽ xử lý đơn hàng này ngay.', sender: 'user', hoursAgo: 10 },
          ],
        },
        {
          customerName: 'M Anh',
          lastMessage: 'Tin nhắn thoại',
          pinned: false,
          unread: 1,
          online: false,
          messages: [
            { text: 'Tin nhắn thoại', sender: 'customer', hoursAgo: 14 },
            { text: 'Chào bạn! Tôi đã nghe tin nhắn thoại của bạn. Bạn có thể nhắn lại được không?', sender: 'user', hoursAgo: 13 },
          ],
        },
        {
          customerName: 'Hungvien',
          lastMessage: 'C ơn a',
          pinned: false,
          unread: 0,
          online: true,
          messages: [
            { text: 'C ơn a', sender: 'customer', hoursAgo: 15 },
            { text: 'Cảm ơn anh đã hỗ trợ. Đơn hàng đã được xử lý tốt.', sender: 'customer', hoursAgo: 15 },
            { text: 'Không có gì! Rất vui được hỗ trợ bạn. Nếu cần gì thêm cứ liên hệ nhé.', sender: 'user', hoursAgo: 14 },
          ],
        },
        {
          customerName: 'Mỹ Nhi (mẹ chaiko)',
          lastMessage: 'Bị ghiền',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'Bị ghiền', sender: 'customer', hoursAgo: 21 },
            { text: 'Sản phẩm này làm mình bị ghiền luôn. Có thể đặt thêm không?', sender: 'customer', hoursAgo: 21 },
            { text: 'Cảm ơn bạn đã yêu thích sản phẩm! Tất nhiên là có thể đặt thêm. Bạn muốn đặt bao nhiêu?', sender: 'user', hoursAgo: 20 },
          ],
        },
        {
          customerName: 'Linh',
          lastMessage: 'cảm ơn em',
          pinned: false,
          unread: 3,
          online: true,
          messages: [
            { text: 'cảm ơn em', sender: 'customer', hoursAgo: 22 },
            { text: 'Cảm ơn em đã hỗ trợ nhiệt tình. Dịch vụ rất tốt!', sender: 'customer', hoursAgo: 22 },
            { text: 'Em sẽ gửi thêm thông tin về sản phẩm mới cho chị nhé.', sender: 'customer', hoursAgo: 21 },
            { text: 'Chị có muốn xem thêm sản phẩm khác không ạ?', sender: 'customer', hoursAgo: 20 },
            { text: 'Cảm ơn chị! Rất vui được phục vụ chị. Em sẽ gửi catalog sản phẩm mới cho chị ngay.', sender: 'user', hoursAgo: 19 },
          ],
        },
      ],
      telegram: [
        {
          customerName: 'Phương Anh',
          lastMessage: 'Hay của tay ban nha j đó',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'Hay của tay ban nha j đó', sender: 'customer', hoursAgo: 22 },
            { text: 'Sản phẩm này có phải hàng từ Tây Ban Nha không?', sender: 'customer', hoursAgo: 22 },
            { text: 'Đúng rồi ạ! Đây là sản phẩm nhập khẩu từ Tây Ban Nha, chất lượng cao.', sender: 'user', hoursAgo: 21 },
          ],
        },
        {
          customerName: 'Hugo Nguyễn',
          lastMessage: 'Hướng nội hướng ngoại có đủ lu...',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'Hướng nội hướng ngoại có đủ lu...', sender: 'customer', daysAgo: 2 },
            { text: 'Sản phẩm này phù hợp cho cả người hướng nội và hướng ngoại. Bạn có muốn tìm hiểu thêm không?', sender: 'customer', daysAgo: 2 },
            { text: 'Cảm ơn bạn đã quan tâm! Đúng vậy, sản phẩm phù hợp với mọi tính cách. Tôi sẽ gửi thêm thông tin chi tiết.', sender: 'user', daysAgo: 2 },
          ],
        },
        {
          customerName: 'Vương Diễm My',
          lastMessage: 'Chòi tiếc quá mẹ e tự mua 2 bé rồi',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'Chòi tiếc quá mẹ e tự mua 2 bé rồi', sender: 'customer', daysAgo: 2 },
            { text: 'Tiếc quá, mẹ em đã tự mua 2 sản phẩm rồi. Lần sau em sẽ đặt qua đây.', sender: 'customer', daysAgo: 2 },
            { text: 'Không sao đâu ạ! Lần sau khi cần gì cứ liên hệ em nhé. Em sẽ ưu đãi đặc biệt cho bạn.', sender: 'user', daysAgo: 2 },
          ],
        },
        {
          customerName: 'Alex Smith',
          lastMessage: 'Hello, I want to order',
          pinned: false,
          unread: 1,
          online: true,
          messages: [
            { text: 'Hello, I want to order', sender: 'customer', hoursAgo: 6 },
            { text: 'Hi! What product would you like to order?', sender: 'user', hoursAgo: 5 },
          ],
        },
        {
          customerName: 'Maria Garcia',
          lastMessage: 'When will my order arrive?',
          pinned: false,
          unread: 0,
          online: false,
          messages: [
            { text: 'When will my order arrive?', sender: 'customer', hoursAgo: 10 },
            { text: 'Your order will arrive in 3-5 business days. I will send you tracking information.', sender: 'user', hoursAgo: 9 },
          ],
        },
        {
          customerName: 'John Doe',
          lastMessage: 'Thanks for the fast delivery!',
          pinned: false,
          unread: 0,
          online: true,
          messages: [
            { text: 'Thanks for the fast delivery!', sender: 'customer', hoursAgo: 18 },
            { text: 'The product is amazing, I will order again', sender: 'customer', hoursAgo: 18 },
            { text: 'Thank you so much! We are happy to serve you again.', sender: 'user', hoursAgo: 17 },
          ],
        },
      ],
    }

    for (const [platform, sampleData] of Object.entries(platformData)) {
      console.log(`\n📦 Seeding messages for ${platform}...`)

      // Check if conversations already exist
      const existing = await Conversation.findOne({ user: admin._id, platform })
      if (existing) {
        console.log(`⚠️  Đã có dữ liệu cho ${platform}, bỏ qua...`)
        continue
      }

      for (let i = 0; i < sampleData.length; i++) {
        const item = sampleData[i]
        const customerAvatar = `https://i.pravatar.cc/150?img=${i + 1}`

        // Create conversation
        const conversation = await Conversation.create({
          platform,
          customerName: item.customerName,
          customerAvatar,
          lastMessage: item.lastMessage,
          pinned: item.pinned,
          unread: item.unread,
          online: item.online,
          user: admin._id,
        })

        // Create messages
        const messages = item.messages.map((msg) => {
          let timestamp
          if (msg.hoursAgo !== undefined) {
            timestamp = new Date(Date.now() - msg.hoursAgo * 3600000)
          } else if (msg.daysAgo !== undefined) {
            timestamp = new Date(Date.now() - msg.daysAgo * 24 * 3600000)
          } else {
            timestamp = new Date()
          }

          return {
            conversation: conversation._id,
            text: msg.text,
            sender: msg.sender,
            tags: msg.tags || [],
            attachments: msg.attachments || [],
            user: admin._id,
            createdAt: timestamp,
            updatedAt: timestamp,
          }
        })

        await Message.insertMany(messages)

        // Add tag to first message if unread
        if (item.unread > 0 && messages.length > 0) {
          await Message.findOneAndUpdate(
            { conversation: conversation._id, text: item.messages[0].text },
            { $push: { tags: 'Quan trọng' } }
          )
        }
      }

      console.log(`✅ Đã seed ${sampleData.length} cuộc trò chuyện cho ${platform}`)
    }

    console.log('\n✅ Hoàn tất seed messages!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi khi seed messages:', error)
    process.exit(1)
  }
}

// Run seed
seedMessages()

