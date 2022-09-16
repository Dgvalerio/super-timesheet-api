import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppointmentModule } from '@/appointment/appointment.module';
import { AuthModule } from '@/auth/auth.module';
import { CategoryModule } from '@/category/category.module';
import { ClientModule } from '@/client/client.module';
import { ProjectModule } from '@/project/project.module';
import { AuthVerifyResolver } from '@/scrapper/auth-verify/auth-verify.resolver';
import { AuthVerifyService } from '@/scrapper/auth-verify/auth-verify.service';
import { SaveAppointmentsResolver } from '@/scrapper/save-appointments/save-appointments.resolver';
import { SaveAppointmentsService } from '@/scrapper/save-appointments/save-appointments.service';
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
    PubSub,
    SeedService,
    ScrapperService,
    ScrapperResolver,
    AuthVerifyService,
    AuthVerifyResolver,
    SaveAppointmentsService,
    SaveAppointmentsResolver,
  ],
  exports: [
    SeedService,
    ScrapperService,
    AuthVerifyService,
    SaveAppointmentsService,
  ],
})
export class ScrapperModule {}
