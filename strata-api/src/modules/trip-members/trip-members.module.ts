import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TripMembersService } from './trip-members.service';
import { TripMembersController } from './trip-members.controller';

@Module({
    imports: [PrismaModule],
    providers: [TripMembersService],
    controllers: [TripMembersController]
})
export class TripMembersModule { }
