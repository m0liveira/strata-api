import { Controller, Post, Patch, Delete, Get, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('friendships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request/:receiverId')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest(@Request() req, @Param('receiverId', ParseIntPipe) receiverId: number) {
    return this.friendshipService.sendRequest(req.user.userId, receiverId);
  }

  @Patch('accept/:requesterId')
  @ApiOperation({ summary: 'Accept friend request' })
  acceptRequest(@Request() req, @Param('requesterId', ParseIntPipe) requesterId: number) {
    return this.friendshipService.acceptRequest(req.user.userId, requesterId);
  }

  @Delete('remove/:otherUserId')
  @ApiOperation({ summary: 'Remove friend or cancel request' })
  removeFriendship(@Request() req, @Param('otherUserId', ParseIntPipe) otherUserId: number) {
    return this.friendshipService.removeFriendship(req.user.userId, otherUserId);
  }

  @Get('all')
  @ApiOperation({ summary: 'List all friendships' })
  getAll(@Request() req) {
    return this.friendshipService.getAll(req.user.userId);
  }

  @Get('accepted')
  @ApiOperation({ summary: 'List accepted friendships' })
  getAccepted(@Request() req) {
    return this.friendshipService.getAccepted(req.user.userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending requests' })
  getPending(@Request() req) {
    return this.friendshipService.getPending(req.user.userId);
  }
}