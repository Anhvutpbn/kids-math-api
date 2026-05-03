import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Tổng quan dashboard — streak, XP, sessions tuần, skill map preview',
    description:
      'Dữ liệu cho màn hình home: streak hiện tại, tổng XP tuần, ' +
      'số buổi học, badge count, top 5 skill theo mastery.',
  })
  @ApiResponse({
    status: 200,
    description: '{ streak, totalXp, sessionsThisWeek, badgeCount, skillMapPreview[] }',
  })
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user._id.toString());
  }

  @Get('session-history')
  @ApiOperation({ summary: 'Lịch sử phiên học theo ngày' })
  @ApiQuery({ name: 'days', required: false, example: '30', description: 'Số ngày lấy lại (mặc định 7)' })
  @ApiResponse({ status: 200, description: 'Array LearningSession' })
  getSessionHistory(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.dashboardService.getSessionHistory(
      user._id.toString(),
      days ? Number(days) : 7,
    );
  }

  @Get('skill-overview')
  @ApiOperation({
    summary: 'Tổng quan 7 kỹ năng — dùng cho radar chart',
    description: 'Trả về masteryScore, locked, errorTypeFlag cho tất cả 7 skills. Dùng để vẽ radar chart trong Flutter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array[7]: { skillId, nameVi, masteryScore, locked, errorTypeFlag, nextReviewAt }',
  })
  getSkillOverview(@CurrentUser() user: any) {
    return this.dashboardService.getSkillOverview(user._id.toString());
  }

  @Get('ai-insight')
  @ApiOperation({
    summary: 'AI insight tổng hợp 7 ngày — dành cho dashboard home',
    description: 'Proxy của GET /ai/insight. weakestSkills, strongestSkills, recommendedFocus, overallAccuracy.',
  })
  @ApiResponse({ status: 200, description: 'AIInsight: weakestSkills, strongestSkills, recommendedFocus, overallAccuracy, avgTimeMs' })
  getAiInsight(@CurrentUser() user: any) {
    return this.dashboardService.getAiInsight(user._id.toString());
  }
}
