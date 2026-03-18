import { Controller, Post, Body, Request, UseGuards, Get, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncPushDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) { }

  @Post('push')
  @ApiOperation({ summary: 'Push local changes to the server' })
  @ApiBody({
    schema: {
      example: {
        lastPulledAt: 1710698000000,
        changes: {
          trips: {
            created: [
              {
                trip_id: 'uuid-here',
                name: 'Paris',
                budget_level: 'MEDIUM',
                intensity_level: 'HIGH',
                travel_style: 'CITY'
              }
            ],
            updated: [],
            deleted: []
          },
          destinations: { created: [], updated: [], deleted: [] },
          locations: { created: [], updated: [], deleted: [] },
          expenses: { created: [], updated: [], deleted: [] }
        }
      }
    }
  })
  async pushChanges(@Request() req, @Body() data: SyncPushDto) {
    return this.syncService.push(req.user.userId, data);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull server changes to the local app' })
  async pullChanges(@Request() req, @Query('lastPulledAt') lastPulledAt: string) {
    const timestamp = lastPulledAt ? parseInt(lastPulledAt, 10) : 0;
    return this.syncService.pull(req.user.userId, timestamp);
  }
}