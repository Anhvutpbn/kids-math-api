import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonQueueService } from './lesson-queue.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Lesson Queue')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('lesson-queue')
export class LessonQueueController {
  constructor(private lessonQueueService: LessonQueueService) {}

  @Get('next')
  @ApiOperation({
    summary: 'Lấy hàng đợi bài học tiếp theo',
    description:
      'Trả về queue pending gần nhất. Nếu chưa có hoặc queue rỗng, tự động tạo daily queue mới ' +
      '(50% skill yếu + 30% trung bình + 20% ôn tập; fallback toàn bộ skills khi tất cả đã thành thạo).',
  })
  @ApiResponse({ status: 200, description: 'LessonQueue với danh sách { questionId, skillId, difficulty }' })
  async getNext(@CurrentUser() user: any) {
    const userId = user._id.toString();
    const existing = await this.lessonQueueService.getNextQueue(userId);
    // Skip empty queues (e.g. created before all-mastered fallback was added)
    if (existing && existing.questions.length > 0) return existing;
    if (existing) {
      await this.lessonQueueService.markDone((existing as any)._id.toString());
    }
    const newQueue = await this.lessonQueueService.generateDailyQueue(userId);
    return this.lessonQueueService.populateQueueQuestions(newQueue);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Tạo daily queue mới (override queue hiện tại)' })
  @ApiResponse({ status: 201, description: 'LessonQueue mới được tạo' })
  generate(@CurrentUser() user: any) {
    return this.lessonQueueService.generateDailyQueue(user._id.toString());
  }

  @Post('generate-weekly')
  @ApiOperation({
    summary: 'Tạo weekly review queue — 20 câu phủ tất cả skills',
    description:
      'Tạo queue ôn tập cuối tuần: 20 câu, trải đều tất cả unlocked skills, ' +
      'diff 1-3. queue_type = weekly_review.',
  })
  @ApiResponse({ status: 201, description: 'LessonQueue weekly mới được tạo' })
  generateWeekly(@CurrentUser() user: any) {
    return this.lessonQueueService.generateWeeklyQueue(user._id.toString());
  }
}
