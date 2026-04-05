import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getUserData(@Request() req) {
    return this.userService.getUserData(req.user.userId);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get users profiles' })
  getPublicProfile(@Param('username') username: string) {
    return this.userService.getPublicProfile(username);
  }

  @Get('id/:ids')
  @ApiOperation({ summary: 'Get users profiles by ID or IDs' })
  getUsersProfileByID(@Param('ids') ids: string) {
    const numericIds = ids.split(',').map(Number);
    return this.userService.getUsersProfileByID(numericIds);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.userId, updateUserDto);
  }
}