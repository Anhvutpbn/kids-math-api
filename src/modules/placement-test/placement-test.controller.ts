import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlacementTestService } from './placement-test.service';
import { SubmitPlacementTestDto } from './dto/submit-placement-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Placement Test')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('placement-test')
export class PlacementTestController {
  constructor(private placementTestService: PlacementTestService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Lấy 7 câu hỏi xếp lớp (1 câu/skill, difficulty=1)' })
  @ApiResponse({ status: 200, description: 'Array 7 câu hỏi — mỗi câu thuộc 1 skill khác nhau' })
  getQuestions() {
    return this.placementTestService.getQuestions();
  }

  @Post('submit')
  @ApiOperation({
    summary: 'Nộp kết quả bài kiểm tra xếp lớp',
    description:
      'Nhận kết quả từng câu, khởi tạo SkillMap ban đầu (correct → mastery=50, wrong → mastery=0), ' +
      'đánh dấu onboardingDone=true.',
  })
  @ApiResponse({ status: 201, description: 'skillMap khởi tạo + initialScores' })
  submit(@CurrentUser() user: any, @Body() dto: SubmitPlacementTestDto) {
    return this.placementTestService.submit(user._id.toString(), dto);
  }
}
