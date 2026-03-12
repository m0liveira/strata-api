import { Controller, Post, Patch, Delete, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TripMembersService } from './trip-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('trip-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trip-members')
export class TripMembersController {
  constructor(private readonly tripMembersService: TripMembersService) {}

  @Post(':tripId/invite/:targetUserId')
  @ApiOperation({ summary: 'Invite a user to a trip' })
  inviteUser(
    @Request() req,
    @Param('tripId') tripId: string,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return this.tripMembersService.inviteUser(tripId, req.user.userId, targetUserId);
  }

  @Patch(':tripId/accept')
  @ApiOperation({ summary: 'Accept a trip invite' })
  acceptInvite(@Request() req, @Param('tripId') tripId: string) {
    return this.tripMembersService.acceptInvite(tripId, req.user.userId);
  }

  @Delete(':tripId/leave')
  @ApiOperation({ summary: 'Leave a trip or decline an invite' })
  leaveTrip(@Request() req, @Param('tripId') tripId: string) {
    return this.tripMembersService.removeMemberOrDecline(tripId, req.user.userId);
  }
}