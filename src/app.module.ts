import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailServiceModule } from './email-service/email-service.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailServiceModule,
    EventEmitterModule.forRoot({ verboseMemoryLeak: true, ignoreErrors: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
