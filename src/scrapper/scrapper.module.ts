import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { ScrapperResolver } from '@/scrapper/scrapper.resolver';
import { ScrapperService } from '@/scrapper/scrapper.service';

@Module({
  imports: [AuthModule, HttpModule],
  providers: [ScrapperService, ScrapperResolver],
  exports: [ScrapperService],
})
export class ScrapperModule {}
