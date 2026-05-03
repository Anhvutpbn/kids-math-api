import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Badges')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tất cả badge (master data)' })
  @ApiResponse({ status: 200, description: 'Array 7 badge definitions' })
  getAllBadges() {
    return this.badgesService.getAllBadges();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Badges của user hiện tại — kèm trạng thái earned/chưa earned',
    description: 'Trả về tất cả 7 badge, mỗi item có earned=true/false và earnedAt.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array badge với { id, nameVi, nameEn, conditionType, conditionValue, earned, earnedAt }',
  })
  async getMyBadges(@CurrentUser() user: any) {
    const userId = user._id.toString();
    const [allBadges, userBadges] = await Promise.all([
      this.badgesService.getAllBadges(),
      this.badgesService.getUserBadges(userId),
    ]);

    const earnedSet = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    return allBadges.map((badge) => {
      const earned = earnedSet.get(badge.id);
      return {
        ...badge.toObject(),
        earned: !!earned,
        earnedAt: earned?.earnedAt ?? null,
      };
    });
  }
}
