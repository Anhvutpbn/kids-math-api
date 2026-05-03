import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Questions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy câu hỏi theo skill — dùng để render bài tập' })
  @ApiQuery({ name: 'skill_id', required: true, example: 'SK01' })
  @ApiQuery({ name: 'difficulty', required: false, example: '1', description: '1=dễ, 2=trung bình, 3=khó' })
  @ApiResponse({ status: 200, description: 'Array questions cho skill_id (filter tuỳ chọn theo difficulty)' })
  findBySkill(
    @Query('skill_id') skillId: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.questionsService.findBySkill(
      skillId,
      difficulty ? Number(difficulty) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy 1 câu hỏi theo id (Q001, Q101…)' })
  @ApiParam({ name: 'id', example: 'Q001' })
  @ApiResponse({ status: 200, description: 'Question document' })
  findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }
}
