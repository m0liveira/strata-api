import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FriendshipModule } from './modules/friendship/friendship.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, FriendshipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
