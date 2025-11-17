# Hướng dẫn tạo file .env

## Cách 1: Copy từ file example

```bash
cd server
copy env.example .env
```

## Cách 2: Tạo thủ công

Tạo file `.env` trong thư mục `server/` với nội dung:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=myapp-secret-key-change-this-in-production-2024
JWT_EXPIRE=7d
NODE_ENV=development
```

## Giải thích các biến:

- **PORT**: Port mà server sẽ chạy (mặc định: 5000)
- **MONGODB_URI**: Connection string đến MongoDB
  - Local: `mongodb://localhost:27017/myapp`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/myapp`
- **JWT_SECRET**: Secret key để sign JWT tokens (nên đổi trong production)
- **JWT_EXPIRE**: Thời gian hết hạn của JWT token (7d = 7 ngày)
- **NODE_ENV**: Môi trường chạy (development/production)

## Lưu ý:

- File `.env` đã được thêm vào `.gitignore` để không commit lên git
- Không chia sẻ file `.env` với người khác
- Trong production, nên dùng JWT_SECRET mạnh và phức tạp hơn



