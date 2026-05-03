import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { getModelToken } from '@nestjs/mongoose';
import * as winston from 'winston';
import * as fs from 'fs';
import * as express from 'express';
import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as AdminJSExpress from '@adminjs/express';

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { User } from './modules/users/schemas/user.schema';
import { Question } from './modules/questions/schemas/question.schema';
import { Skill } from './modules/skills/schemas/skill.schema';
import { Badge } from './modules/badges/schemas/badge.schema';
import { LearningSession } from './modules/sessions/schemas/session.schema';
import { SkillMap } from './modules/skills/schemas/skill-map.schema';

if (!fs.existsSync('logs')) fs.mkdirSync('logs');

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context }) =>
          `${timestamp} [${context ?? 'App'}] ${level}: ${message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

async function bootstrap() {
  // bodyParser: false — AdminJS login form cần parse body riêng
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    bodyParser: false,
  });

  const expressApp = app.getHttpAdapter().getInstance();

  // ── AdminJS ──────────────────────────────────────────────────────────
  const adminJs = new AdminJS({
    rootPath: '/admin',
    branding: { companyName: 'Kids Math Admin', logo: false, favicon: '' },
    resources: [
      {
        resource: app.get(getModelToken(User.name)),
        options: {
          navigation: { name: 'Users', icon: 'User' },
          listProperties: ['email', 'childName', 'childAge', 'totalXp', 'streakCurrent', 'onboardingDone', 'createdAt'],
          filterProperties: ['email', 'childName', 'onboardingDone'],
          editProperties: ['childName', 'childAge', 'language', 'avatarId', 'totalXp', 'streakCurrent', 'onboardingDone'],
          showProperties: ['email', 'childName', 'childAge', 'language', 'avatarId', 'totalXp', 'streakCurrent', 'streakLongest', 'lastSessionDate', 'onboardingDone', 'createdAt'],
          actions: { new: { isAccessible: false } },
        },
      },
      {
        resource: app.get(getModelToken(Question.name)),
        options: {
          navigation: { name: 'Content', icon: 'Document' },
          listProperties: ['id', 'skillId', 'type', 'questionVi', 'difficulty'],
          filterProperties: ['skillId', 'type', 'difficulty'],
          editProperties: ['id', 'skillId', 'type', 'questionVi', 'questionEn', 'options', 'correctAnswer', 'difficulty', 'hintVi'],
        },
      },
      {
        resource: app.get(getModelToken(Skill.name)),
        options: {
          navigation: { name: 'Content', icon: 'Document' },
          listProperties: ['id', 'nameVi', 'nameEn', 'order'],
          editProperties: ['nameVi', 'nameEn', 'descriptionVi', 'order'],
          actions: { new: { isAccessible: false }, delete: { isAccessible: false } },
        },
      },
      {
        resource: app.get(getModelToken(Badge.name)),
        options: {
          navigation: { name: 'Content', icon: 'Document' },
          listProperties: ['id', 'nameVi', 'conditionType', 'conditionValue'],
          editProperties: ['nameVi', 'nameEn', 'descriptionVi', 'conditionType', 'conditionValue'],
        },
      },
      {
        resource: app.get(getModelToken(LearningSession.name)),
        options: {
          navigation: { name: 'Monitoring', icon: 'BarChart' },
          listProperties: ['userId', 'totalQuestions', 'correctCount', 'stars', 'xpEarned', 'endedAt', 'createdAt'],
          filterProperties: ['stars'],
          actions: { new: { isAccessible: false }, edit: { isAccessible: false }, delete: { isAccessible: false } },
        },
      },
      {
        resource: app.get(getModelToken(SkillMap.name)),
        options: {
          navigation: { name: 'Monitoring', icon: 'BarChart' },
          listProperties: ['userId', 'skillId', 'masteryScore', 'locked', 'errorTypeFlag', 'lastPracticedAt'],
          filterProperties: ['skillId', 'locked', 'errorTypeFlag'],
          actions: { new: { isAccessible: false }, edit: { isAccessible: false }, delete: { isAccessible: false } },
        },
      },
    ],
  });

  const adminRouter = (AdminJSExpress as any).buildAuthenticatedRouter(
    adminJs,
    {
      authenticate: async (email: string, password: string) => {
        if (
          email === (process.env.ADMIN_EMAIL ?? 'admin@kidsmath.local') &&
          password === (process.env.ADMIN_PASSWORD ?? 'admin123')
        ) {
          return { email, role: 'admin' };
        }
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: process.env.JWT_SECRET ?? 'kids-math-admin-cookie-2026',
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
      secret: process.env.JWT_SECRET ?? 'kids-math-admin-cookie-2026',
    },
  );

  // Mount tại '/admin' — Express strip prefix, router nhận '/login' thay vì '/admin/login'
  // Phải đặt TRƯỚC body parsers (AdminJS dùng express-formidable tự parse form)
  expressApp.use('/admin', adminRouter);
  // ── End AdminJS ──────────────────────────────────────────────────────

  // Body parsers cho API (sau AdminJS scope)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Kids Math API')
    .setDescription(
      'Backend API cho ứng dụng học toán trẻ em 5–7 tuổi. ' +
      'Xác thực bằng JWT Bearer token — lấy token từ POST /auth/login hoặc POST /auth/register.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addTag('Auth', 'Đăng ký, đăng nhập, onboarding')
    .addTag('Users', 'Hồ sơ người dùng')
    .addTag('Skills', 'Danh sách kỹ năng và skill map')
    .addTag('Questions', 'Ngân hàng câu hỏi')
    .addTag('Placement Test', 'Bài kiểm tra xếp lớp ban đầu')
    .addTag('Sessions', 'Phiên học — bắt đầu / nộp câu hỏi / kết thúc')
    .addTag('Lesson Queue', 'Hàng đợi bài học cá nhân hóa')
    .addTag('AI', 'Phân tích sau phiên học — điều chỉnh lộ trình tự động')
    .addTag('Dashboard', 'Tổng hợp dữ liệu cho phụ huynh')
    .addTag('Badges', 'Huy hiệu và thành tích')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
  console.log(`🔧 Admin panel: http://localhost:${port}/admin`);
}
bootstrap();
