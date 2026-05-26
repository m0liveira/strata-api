import { Controller, Post, Patch, Delete, Param, Request, UseGuards, ParseIntPipe, Get, Body } from '@nestjs/common';
import { TripMembersService } from './trip-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({ example: 500 })
  @IsOptional()
  @IsNumber()
  personal_budget: number | null = null;
}

@ApiTags('trip-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trip-members')
export class TripMembersController {
  constructor(private readonly tripMembersService: TripMembersService) { }

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

  @Patch(':tripId/budget')
  @ApiOperation({ summary: 'Update a user budget for a trip' })
  updateBudget(
    @Request() req,
    @Param('tripId') tripId: string,
    @Body() body: UpdateBudgetDto
  ) {
    return this.tripMembersService.updateBudget(tripId, req.user.userId, body.personal_budget);
  }

  @Delete(':tripId/leave')
  @ApiOperation({ summary: 'Leave a trip or decline an invite' })
  leaveTrip(@Request() req, @Param('tripId') tripId: string) {
    return this.tripMembersService.removeMemberOrDecline(tripId, req.user.userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get members of a specific trip' })
  getTripMembers(@Param('id') id: string, @Request() req: any) {
    return this.tripMembersService.getTripMembers(id, req.user.userId);
  }

  @Get('invites')
  @ApiOperation({ summary: 'Get pending invites for a user' })
  getTripInvites(@Request() req: any) {
    return this.tripMembersService.getTripInvites(req.user.userId);
  }
}