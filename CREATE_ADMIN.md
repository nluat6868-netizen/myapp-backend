# Hướng dẫn tạo Admin User trong MongoDB

## Vấn đề

Khi chuyển từ localStorage sang MongoDB, tài khoản admin mặc định cần được tạo trong database.

## Cách 1: Dùng script seed (Khuyến nghị)

### Chạy script:

```bash
cd server
npm run seed:admin
```

Script sẽ:
- Kết nối đến MongoDB
- Kiểm tra xem admin đã tồn tại chưa
- Nếu chưa có: Tạo admin user mới
- Nếu đã có: Cập nhật thành admin và reset password

### Thông tin Admin mặc định:

- **Email**: `nluat134@gmail.com`
- **Mật khẩu**: `admin123`
- **Tên**: `anhluat165`
- **Role**: `admin`

## Cách 2: Tạo qua API Register

### Bước 1: Đảm bảo backend đang chạy

```bash
cd server
npm start
```

### Bước 2: Gọi API register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "anhluat165",
    "email": "nluat134@gmail.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Hoặc dùng Postman:
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/register`
- **Body** (JSON):
  ```json
  {
    "name": "anhluat165",
    "email": "nluat134@gmail.com",
    "password": "admin123",
    "role": "admin"
  }
  ```

## Cách 3: Tạo trực tiếp trong MongoDB

### Bước 1: Kết nối MongoDB

```bash
mongosh "mongodb://localhost:27017/myapp"
```

### Bước 2: Tạo admin user (không khuyến nghị - password sẽ không được hash)

```javascript
// Lưu ý: Cách này không hash password, nên không thể login được
// Chỉ dùng để test hoặc debug
db.users.insertOne({
  name: "anhluat165",
  email: "nluat134@gmail.com",
  password: "admin123", // Sẽ không hoạt động vì không được hash
  role: "admin",
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**⚠️ Lưu ý**: Cách này không hash password, nên không thể đăng nhập được. Chỉ dùng script seed hoặc API.

## Kiểm tra Admin đã được tạo

### Cách 1: Test login qua API

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nluat134@gmail.com",
    "password": "admin123"
  }'
```

Kết quả mong đợi:
```json
{
  "_id": "...",
  "name": "anhluat165",
  "email": "nluat134@gmail.com",
  "role": "admin",
  "permissions": [],
  "token": "..."
}
```

### Cách 2: Kiểm tra trong MongoDB

```bash
mongosh "mongodb://localhost:27017/myapp"
```

```javascript
db.users.findOne({ email: "nluat134@gmail.com" })
```

## Troubleshooting

### Lỗi: "User already exists"

- User đã tồn tại với email này
- Chạy lại script seed để cập nhật thành admin
- Hoặc xóa user cũ và tạo lại:
  ```javascript
  db.users.deleteOne({ email: "nluat134@gmail.com" })
  ```

### Lỗi: "Cannot connect to MongoDB"

1. Đảm bảo MongoDB đang chạy:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. Kiểm tra `MONGODB_URI` trong `server/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/myapp
   ```

### Lỗi: "Invalid password" khi login

- Password đã được hash trong database
- Đảm bảo đang dùng password gốc: `admin123`
- Nếu đã đổi password, cần reset lại bằng script seed

### Reset password admin

Chạy lại script seed:
```bash
npm run seed:admin
```

Script sẽ tự động reset password về `admin123`.

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: 
- Đổi mật khẩu admin sau khi đăng nhập lần đầu
- Không commit file `.env` lên git
- Trong production, dùng JWT_SECRET mạnh hơn
- Không để password mặc định trong production



