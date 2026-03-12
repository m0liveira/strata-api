import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { FollowsModule } from './modules/follows/follows.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, FriendshipModule, FollowsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
