# Backend API Server

Backend API server cho My APP sử dụng Node.js, Express, và MongoDB.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp env.example .env
```

3. Cấu hình các biến môi trường trong `.env`:
- `PORT`: Port cho server (mặc định: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key cho JWT
- `FRONTEND_URL`: URL của frontend application

## Chạy server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

Sau khi chạy server, truy cập Swagger documentation tại:
```
http://localhost:5000/api-docs
```

## Seed Data

### Tạo Super Admin
```bash
node utils/seedSuperAdmin.js
```

### Tạo Admin
```bash
node utils/seedAdmin.js
```

### Seed Messages (Facebook, Zalo, Telegram)
```bash
node utils/seedMessages.js
```

## Cấu trúc thư mục

```
server/
├── config/          # Cấu hình database, swagger
├── controllers/      # Controllers xử lý logic
├── middleware/       # Middleware (auth, error handler)
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Utilities và seed scripts
└── server.js        # Entry point
```

## API Endpoints

- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/products` - Product management
- `/api/orders` - Order management
- `/api/messages` - Messages (Facebook, Zalo, Telegram)
- `/api/templates` - Template management
- `/api/tones` - Tone AI management
- Và nhiều endpoints khác...

Xem chi tiết tại Swagger documentation.

