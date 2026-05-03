import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateAvatarDto {
  @ApiProperty({ example: 'bear', enum: ['bear', 'cat', 'dog', 'rabbit', 'fox', 'panda', 'lion'] })
  @IsString()
  @IsIn(['bear', 'cat', 'dog', 'rabbit', 'fox', 'panda', 'lion'])
  avatarId: string;
}

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy profile người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'User profile (không có password)' })
  async getMe(@CurrentUser() user: any) {
    const full = await this.usersService.findById(user._id.toString());
    if (!full) return user;
    const { password: _pw, ...profile } = (full as any).toObject();
    return profile;
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Cập nhật avatar' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateAvatar(@CurrentUser() user: any, @Body() dto: UpdateAvatarDto) {
    await this.usersService.updateAvatar(user._id.toString(), dto.avatarId);
    return { updated: true };
  }
}
