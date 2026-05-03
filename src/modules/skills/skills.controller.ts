import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Skills')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách 7 kỹ năng (master data)' })
  @ApiResponse({ status: 200, description: 'Array of 7 skills sorted by order' })
  findAll() {
    return this.skillsService.findAll();
  }

  @Get('map')
  @ApiOperation({ summary: 'Skill Map của user hiện tại — mastery score + trạng thái từng skill' })
  @ApiResponse({ status: 200, description: 'Array 7 SkillMap entries với masteryScore, locked, errorTypeFlag' })
  getMySkillMap(@CurrentUser() user: any) {
    return this.skillsService.getSkillMap(user._id.toString());
  }

  @Get('map/:skillId')
  @ApiOperation({ summary: 'Chi tiết 1 skill trong Skill Map' })
  @ApiParam({ name: 'skillId', example: 'SK01' })
  @ApiResponse({ status: 200, description: 'SkillMap entry cho skillId' })
  getSkillEntry(@CurrentUser() user: any, @Param('skillId') skillId: string) {
    return this.skillsService.getSkillEntry(user._id.toString(), skillId);
  }
}
