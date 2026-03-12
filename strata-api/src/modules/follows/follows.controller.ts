import { Controller, Post, Delete, Get, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('followers')
  @ApiOperation({ summary: 'List user followers' })
  getFollowers(@Request() req) {
    return this.followsService.getFollowers(req.user.userId);
  }

  @Get('following')
  @ApiOperation({ summary: 'List users that the user follows' })
  getFollowing(@Request() req) {
    return this.followsService.getFollowing(req.user.userId);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Follow an user' })
  follow(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.follow(req.user.userId, userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Stop following an user' })
  unfollow(@Request() req, @Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.unfollow(req.user.userId, userId);
  }
}