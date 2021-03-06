import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Appointment } from '@/appointment/appointment.entity';
import { AppointmentResolver } from '@/appointment/appointment.resolver';
import { AppointmentService } from '@/appointment/appointment.service';
import { CategoryModule } from '@/category/category.module';
import { ProjectModule } from '@/project/project.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    UserModule,
    ProjectModule,
    CategoryModule,
    TypeOrmModule.forFeature([Appointment]),
  ],
  providers: [AppointmentService, AppointmentResolver],
  exports: [AppointmentService],
})
export class AppointmentModule {}
