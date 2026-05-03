import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Phân tích sau phiên học — cập nhật Skill Map + tạo queue mới',
    description:
      'Gọi sau POST /sessions/:id/end. Pipeline: ' +
      'ErrorClassifier → MasteryCalculator → update SkillMap → update XP/streak → ' +
      'check badges → generate LessonQueue mới.',
  })
  @ApiBody({ schema: { example: { sessionId: '64a1b2c3d4e5f6a7b8c9d0e1' } } })
  @ApiResponse({
    status: 201,
    description: '{ insight, xpEarned, streak, newBadges, nextQueueId }',
  })
  analyze(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string,
  ) {
    return this.aiService.analyzeSession(sessionId, user._id.toString());
  }

  @Get('insight')
  @ApiOperation({
    summary: 'AI insight tổng hợp 7 ngày gần nhất',
    description: 'Trả về weakestSkills, strongestSkills, recommendedFocus, overallAccuracy.',
  })
  @ApiResponse({ status: 200, description: 'AIInsight object' })
  getInsight(@CurrentUser() user: any) {
    return this.aiService.getInsight(user._id.toString());
  }

  @Get('weak-areas')
  @ApiOperation({
    summary: 'Top 3 kỹ năng yếu nhất của user',
    description: 'Trả về 3 skills có masteryScore thấp nhất (chỉ unlocked skills). Dùng để highlight focus areas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array[3]: { skillId, masteryScore, errorTypeFlag, lastPracticedAt }',
  })
  getWeakAreas(@CurrentUser() user: any) {
    return this.aiService.getWeakAreas(user._id.toString());
  }
}
