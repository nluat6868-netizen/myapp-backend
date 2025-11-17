# File .env đã được tạo!

File `.env` trong thư mục `server/` đã được tạo với các thông tin sau:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=myapp-secret-key-change-this-in-production-2024
JWT_EXPIRE=7d
NODE_ENV=development
```

## Cần làm gì tiếp theo:

1. **Kiểm tra MongoDB:**
   - Đảm bảo MongoDB đang chạy
   - Nếu dùng MongoDB Atlas, cập nhật `MONGODB_URI` trong file `.env`

2. **Cập nhật JWT_SECRET (tùy chọn):**
   - Trong production, nên đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên mạnh hơn
   - Có thể dùng: `openssl rand -base64 32` để tạo secret key

3. **Chạy backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

## Lưu ý:

- File `.env` đã được thêm vào `.gitignore` nên sẽ không bị commit lên git
- Không chia sẻ file `.env` với người khác
- File `env.example` là template, có thể commit lên git



