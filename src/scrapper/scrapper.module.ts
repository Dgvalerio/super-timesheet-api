import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppointmentModule } from '@/appointment/appointment.module';
import { AuthModule } from '@/auth/auth.module';
import { CategoryModule } from '@/category/category.module';
import { ClientModule } from '@/client/client.module';
import { ProjectModule } from '@/project/project.module';
import { AuthVerifyResolver } from '@/scrapper/auth-verify/auth-verify.resolver';
import { AuthVerifyService } from '@/scrapper/auth-verify/auth-verify.service';
import { ScrapperResolver } from '@/scrapper/scrapper.resolver';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { SeedService } from '@/scrapper/seed.service';
import { UserModule } from '@/user/user.module';

import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    ClientModule,
    ProjectModule,
    UserModule,
    CategoryModule,
    AppointmentModule,
  ],
  providers: [
    ScrapperService,
    ScrapperResolver,
    SeedService,
    PubSub,
    AuthVerifyService,
    AuthVerifyResolver,
  ],
  exports: [ScrapperService, SeedService],
})
export class ScrapperModule {}
