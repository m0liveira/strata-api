import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { FollowsModule } from './modules/follows/follows.module';
import { TripMembersController } from './modules/trip-members/trip-members.controller';
import { TripMembersService } from './modules/trip-members/trip-members.service';
import { TripMembersModule } from './modules/trip-members/trip-members.module';
import { SyncModule } from './modules/sync/sync.module';
import { ChatService } from './modules/chat/chat.service';
import { ChatModule } from './modules/chat/chat.module';
import { TripModule } from './modules/trip/trip.module';
import { SupabaseService } from './modules/supabase/supabase.service';
import { SupabaseModule } from './modules/supabase/supabase.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, FriendshipModule, FollowsModule, TripMembersModule, SyncModule, ChatModule, TripModule, SupabaseModule],
  controllers: [AppController, TripMembersController],
  providers: [AppService, TripMembersService, ChatService, SupabaseService],
})
export class AppModule {}
