import { Controller, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
import { TripService } from './trip.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import express from 'express';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripController {
    constructor(private readonly tripService: TripService) { }

    @Get('/discover/public')
    @ApiOperation({ summary: 'Get public trips' })
    getPublicTrips() {
        return this.tripService.getPublicTrips();
    }

    @Get('/discover/friends')
    @ApiOperation({ summary: 'Get trips shared by friends' })
    getFriendSharedTrips(@Request() req: any) {
        return this.tripService.getFriendSharedTrips(req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get trip by ID' })
    getTripById(@Param('id') id: string, @Request() req: any) {
        return this.tripService.getTripById(id, req.user.userId);
    }

    @Get('/discover/:id')
    @ApiOperation({ summary: 'Get shared trip by ID' })
    getSharedTripsById(@Param('id') id: string) {
        return this.tripService.getSharedTripsById(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate PDF with the trip itinerary' })
    async getTripPdf(
        @Param('id') id: string,
        @Res() res: express.Response
    ) {
        const doc = await this.tripService.generateTripPdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="strata-itinerary.pdf"`,
        });

        doc.pipe(res);
    }
}
