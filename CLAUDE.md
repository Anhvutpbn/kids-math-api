# CLAUDE.md — kids-math-api

## Project

NestJS REST API cho Kids Math Learning App. Backend duy nhất phục vụ Flutter mobile app.

## Stack

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | NestJS (Node.js) |
| Database | MongoDB Atlas free tier |
| ODM | Mongoose (`@nestjs/mongoose`) |
| Auth | JWT (`@nestjs/jwt`, `passport-jwt`) |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` + `.env` |
| Master data | CSV files trong `data/` — seed vào MongoDB khi startup |

## Cấu trúc thư mục

```
src/
├── modules/
│   ├── auth/          # JWT login/register
│   ├── users/         # User profile
│   ├── skills/        # Skill master data (7 skills)
│   ├── questions/     # Question bank (từ CSV)
│   ├── sessions/      # Learning session + question results
│   ├── lesson-queue/  # Queue tự động tạo cho mỗi session
│   ├── ai/            # Core: error classifier, mastery calc, queue builder
│   │   └── strategies/
│   │       ├── error-classifier.ts    ← phân loại lỗi: conceptual/careless/slow
│   │       ├── mastery-calculator.ts  ← tính delta mastery sau session
│   │       └── queue-builder.ts       ← tạo lesson queue cá nhân hóa
│   ├── dashboard/     # Parent dashboard aggregation
│   └── badges/        # Badge definitions + user badges
├── common/            # Guards, filters, decorators, interceptors
├── config/            # App config, database config
└── seed/              # CSV loader + seed service
data/
├── skills.csv
├── badges.csv
└── questions/
    ├── sk01_number_recognition.csv
    ├── sk02_number_100.csv
    ├── sk03_counting.csv
    ├── sk04_comparison.csv
    ├── sk05_addition.csv
    ├── sk06_subtraction.csv
    └── sk07_missing_number.csv
assets/avatars/        # Avatar images (serve static)
```

## Environment Variables

Xem `.env.example`. Các biến bắt buộc:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kids-math
JWT_SECRET=<random-32-chars>
JWT_EXPIRES_IN=7d
DATA_DIR=./data
ASSETS_DIR=./assets
```

## Conventions

- Module structure: `module.ts` + `controller.ts` + `service.ts` + `schemas/` + `dto/`
- Tất cả response bọc trong `TransformInterceptor`: `{ success: true, data: ..., timestamp }`
- Error dùng `HttpExceptionFilter` — trả về `{ success: false, message, statusCode }`
- DTO dùng `class-validator` decorators, không validate thủ công
- Schema Mongoose dùng `@Schema({ timestamps: true })` — tự có `createdAt`, `updatedAt`
- Seed chạy **idempotent**: kiểm tra `id` tồn tại trước khi insert, không duplicate

## AI Module — Logic cốt lõi

Đây là phần quan trọng nhất. Xem `docs/WORKFLOW_AI_ADAPTIVE.md` để hiểu đầy đủ.

```
POST /ai/analyze  →  ErrorClassifier  →  MasteryCalculator  →  update SkillMap
                                      →  QueueBuilder       →  create LessonQueue
```

**Mastery delta rules:**
- `conceptual` error: `-15`
- `careless` error: `-5`
- `slow` (đúng nhưng chậm): `0`
- Correct `>= 90%` + fast: `+20`
- Correct `>= 90%` + slow: `+12`
- Correct `70-89%`: `+8`
- Correct `50-69%`: `+3`
- Clamp: `[0, 100]`

**Queue builder ratio:** 50% skill yếu + 30% skill trung bình + 20% ôn review

**Spaced repetition:** skill `>= 80%` → `next_review_at = today + 7 ngày`

## API Endpoints chính

```
POST   /auth/register
POST   /auth/login
GET    /skills
GET    /placement-test/questions
POST   /placement-test/submit
POST   /session/start
POST   /question/submit          ← ghi kết quả từng câu, check inject_tutorial
POST   /session/end
POST   /ai/analyze               ← trigger sau session/end
GET    /skill-map/:userId
GET    /lesson-queue/:userId/next
GET    /dashboard/:userId/summary
GET    /ai/insight/:userId
GET    /user/:id/badges
```

## Quy tắc inject_tutorial

Trong `POST /question/submit`, nếu nhận `consecutive_errors: true`:
- Đếm lỗi liên tiếp cho `skill_id` đó trong session
- Nếu lỗi >= 3 lần và có tutorial cho skill → trả về `inject_tutorial: true`
- Reset counter sau khi inject

## Lưu ý

- CSV là **source of truth** cho skills, questions, badges — không sửa trực tiếp trên DB
- Không có push notification, không có email service
- Tất cả ảnh serve qua `ServeStaticModule` từ `assets/` folder
- Mỗi `QuestionResult` lưu `attempt_number` (1, 2, 3) và `time_spent_ms`
- `LessonQueue` có `queue_type`: `daily` hoặc `weekly_review`
