# Swagger API Documentation Setup

## Cài đặt

### 1. Cài đặt packages

```bash
cd server
npm install
```

Packages đã được thêm:
- `swagger-jsdoc`: Generate Swagger spec từ JSDoc comments
- `swagger-ui-express`: Serve Swagger UI interface

### 2. Truy cập Swagger UI

Sau khi start server, truy cập:

```
http://localhost:5000/api-docs
```

## Cấu trúc

### File cấu hình

- `server/config/swagger.js` - Cấu hình Swagger
- `server/server.js` - Đã thêm Swagger UI route

### JSDoc Comments

Swagger documentation được generate từ JSDoc comments trong:
- Controllers: `server/controllers/*.js`
- Routes: `server/routes/*.js`
- Server: `server/server.js`

## Cách sử dụng

### 1. Xem API Documentation

1. Start server:
   ```bash
   cd server
   npm start
   ```

2. Mở browser:
   ```
   http://localhost:5000/api-docs
   ```

### 2. Test API trực tiếp trong Swagger UI

1. Mở Swagger UI tại `http://localhost:5000/api-docs`
2. Chọn endpoint muốn test
3. Click "Try it out"
4. Điền thông tin (nếu cần)
5. Click "Execute"
6. Xem kết quả

### 3. Authentication trong Swagger

Để test các protected endpoints:

1. Login qua `/api/auth/login` để lấy token
2. Click nút "Authorize" ở đầu trang Swagger
3. Nhập token: `Bearer <your-token>`
4. Click "Authorize"
5. Bây giờ có thể test các protected endpoints

## Thêm Documentation cho Endpoint mới

### Ví dụ: Thêm Swagger docs cho endpoint

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
```

### Tags

Sử dụng tags để nhóm các endpoints:
- `[Authentication]` - Auth endpoints
- `[Users]` - User management
- `[FAQs]` - FAQ management
- `[Products]` - Product management
- `[Orders]` - Order management
- `[Templates]` - Template management
- `[Tones]` - Tone AI management
- `[Settings]` - Settings management
- `[General]` - General endpoints

### Schemas

Định nghĩa schemas trong `components/schemas` để tái sử dụng:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     MyModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */
```

Sau đó reference:
```javascript
schema:
  $ref: '#/components/schemas/MyModel'
```

## Cấu hình nâng cao

### Thay đổi server URL

Trong `server/config/swagger.js`:

```javascript
servers: [
  {
    url: process.env.API_URL || 'http://localhost:5000',
    description: 'Development server',
  },
  {
    url: 'https://api.production.com',
    description: 'Production server',
  },
]
```

### Customize Swagger UI

Trong `server/server.js`:

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'My App API Documentation',
  customfavIcon: '/favicon.ico',
}))
```

## Troubleshooting

### Swagger UI không hiển thị

1. Kiểm tra packages đã được cài:
   ```bash
   npm list swagger-jsdoc swagger-ui-express
   ```

2. Kiểm tra server đang chạy:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. Kiểm tra route `/api-docs`:
   ```bash
   curl http://localhost:5000/api-docs
   ```

### Documentation không hiển thị đầy đủ

1. Kiểm tra JSDoc comments có đúng format không
2. Kiểm tra file paths trong `swagger.js`:
   ```javascript
   apis: ['./routes/*.js', './controllers/*.js', './server.js']
   ```

### Lỗi "Cannot find module"

1. Reinstall packages:
   ```bash
   cd server
   rm -rf node_modules
   npm install
   ```

## Best Practices

1. **Luôn thêm Swagger docs** cho endpoint mới
2. **Sử dụng schemas** để tái sử dụng
3. **Thêm examples** để dễ hiểu
4. **Group endpoints** bằng tags
5. **Document errors** với status codes
6. **Mô tả rõ ràng** request/response

## Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)



