import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MultiplicationService } from './multiplication.service';
import { SubmitMultiplicationDto } from './dto/submit-multiplication.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Multiplication')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('multiplication')
export class MultiplicationController {
  constructor(private readonly multiplicationService: MultiplicationService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Tiến độ học bảng cửu chương — level đã mở, điểm tốt nhất' })
  getProgress(@CurrentUser() user: any) {
    return this.multiplicationService.getProgress(user._id.toString());
  }

  @Post('session/save')
  @ApiOperation({ summary: 'Lưu kết quả 1 session — cập nhật progress, mở level tiếp theo' })
  saveSession(@CurrentUser() user: any, @Body() dto: SubmitMultiplicationDto) {
    return this.multiplicationService.saveSession(user._id.toString(), dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lịch sử học — danh sách session gần nhất' })
  getHistory(
    @CurrentUser() user: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.multiplicationService.getHistory(user._id.toString(), limit, offset);
  }
}
