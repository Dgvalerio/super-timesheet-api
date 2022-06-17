import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { ScrapperService } from '@/scrapper/scrapper.service';

@Module({
  imports: [AuthModule, HttpModule],
  providers: [ScrapperService],
  exports: [ScrapperService],
})
export class ScrapperModule {}
