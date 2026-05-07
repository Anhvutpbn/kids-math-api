import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemoryGameService } from './memory-game.service';
import { SubmitMemoryGameDto } from './dto/submit-memory-game.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Memory Game')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('memory-game')
export class MemoryGameController {
  constructor(private readonly memoryGameService: MemoryGameService) {}

  @Get('levels')
  @ApiOperation({ summary: 'Danh sách 16 level config (numBoxes, displayTime, mistakes)' })
  getLevels() {
    return this.memoryGameService.getLevels();
  }

  @Get('progress')
  @ApiOperation({ summary: 'Tiến độ của user — maxLevelUnlocked, tiersCompleted' })
  getProgress(@CurrentUser() user: any) {
    return this.memoryGameService.getProgress(user._id.toString());
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê chi tiết — lịch sử chơi, tỉ lệ thắng' })
  getStats(@CurrentUser() user: any) {
    return this.memoryGameService.getStats(user._id.toString());
  }

  @Post('submit')
  @ApiOperation({ summary: 'Nộp kết quả 1 lần chơi — lưu DB, mở khóa level tiếp theo, trao badge' })
  submit(@CurrentUser() user: any, @Body() dto: SubmitMemoryGameDto) {
    return this.memoryGameService.submit(user._id.toString(), dto);
  }
}
