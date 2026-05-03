import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sessions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Bắt đầu phiên học mới' })
  @ApiResponse({ status: 201, description: 'LearningSession document với _id dùng cho các bước tiếp theo' })
  startSession(@CurrentUser() user: any) {
    return this.sessionsService.startSession(user._id.toString());
  }

  @Post('questions/submit')
  @ApiOperation({
    summary: 'Nộp kết quả 1 câu hỏi trong phiên học',
    description:
      'Ghi QuestionResult. Nếu consecutiveErrors=true và sai >= 3 lần cùng skill → trả về inject_tutorial=true.',
  })
  @ApiBody({
    schema: {
      example: {
        sessionId: '64a1b2c3d4e5f6a7b8c9d0e1',
        questionId: 'Q001',
        skillId: 'SK01',
        userAnswer: '3',
        isCorrect: true,
        timeSpentMs: 3500,
        attemptNumber: 1,
        consecutiveErrors: false,
      },
    },
  })
  @ApiResponse({ status: 201, description: '{ accepted: true, inject_tutorial: false }' })
  submitQuestion(
    @CurrentUser() user: any,
    @Body()
    body: {
      sessionId: string;
      questionId: string;
      skillId: string;
      userAnswer: string;
      isCorrect: boolean;
      timeSpentMs: number;
      attemptNumber: number;
      consecutiveErrors?: boolean;
    },
  ) {
    return this.sessionsService.submitQuestion({
      ...body,
      userId: user._id.toString(),
    });
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'Kết thúc phiên học — tính stars, XP' })
  @ApiParam({ name: 'id', description: 'Session _id' })
  @ApiBody({ schema: { example: { totalDurationMs: 300000 } } })
  @ApiResponse({ status: 201, description: 'session, stars, xpEarned, accuracy, correctCount' })
  endSession(
    @Param('id') id: string,
    @Body('totalDurationMs') totalDurationMs: number,
  ) {
    return this.sessionsService.endSession(id, totalDurationMs);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lịch sử phiên học (mặc định 7 ngày gần nhất)' })
  @ApiQuery({ name: 'days', required: false, example: '7' })
  @ApiResponse({ status: 200, description: 'Array LearningSession' })
  getHistory(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.sessionsService.getUserSessions(
      user._id.toString(),
      days ? Number(days) : 7,
    );
  }

  @Get(':id/detail')
  @ApiOperation({ summary: 'Chi tiết kết quả từng câu của 1 phiên học' })
  @ApiParam({ name: 'id', description: 'Session _id' })
  @ApiResponse({ status: 200, description: 'Array QuestionResult' })
  getSessionDetail(@Param('id') id: string) {
    return this.sessionsService.getSessionResults(id);
  }
}
