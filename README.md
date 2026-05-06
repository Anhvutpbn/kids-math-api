# Kids Math API

Backend REST API cho ứng dụng học toán dành cho trẻ em 5–7 tuổi.

## Giới thiệu

API phục vụ mobile app Flutter, cung cấp hệ thống học toán thích ứng (AI Adaptive Learning) giúp trẻ luyện tập 8 kỹ năng toán từ cơ bản đến nâng cao. Hệ thống tự động phát hiện điểm yếu và điều chỉnh lộ trình học cá nhân hóa cho từng bé.

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | NestJS (Node.js + TypeScript) |
| Database | MongoDB Atlas |
| Auth | JWT (access token 7 ngày) |
| Master data | CSV seed tự động khi khởi động |

## 8 Kỹ năng (Skill Map)

```
SK01 Nhận biết số 0-10
SK02 Nhận biết số 0-100   (yêu cầu SK01)
SK03 Đếm số               (yêu cầu SK01)
SK04 So sánh số           (yêu cầu SK02)
SK05 Phép cộng            (yêu cầu SK03)
SK06 Phép trừ             (yêu cầu SK05)
SK07 Điền số còn thiếu    (yêu cầu SK04 + SK05)
SK08 Chọn số lớn/bé nhất  (yêu cầu SK04)
```

## Cài đặt

```bash
npm install
```

Tạo file `.env` từ `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kids-math
JWT_SECRET=<random-32-chars>
JWT_EXPIRES_IN=7d
DATA_DIR=./data
ASSETS_DIR=./assets
```

## Chạy server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API chính

```
POST  /auth/register
POST  /auth/login
GET   /skills
POST  /placement-test/submit
POST  /session/start
POST  /question/submit
POST  /session/end
POST  /ai/analyze
GET   /lesson-queue/:userId/next
GET   /skill-map/:userId
GET   /dashboard/:userId/summary
```

## Mobile app

[kids-math-app](https://github.com/Anhvutpbn/kids-math-mob) — Flutter + Riverpod
