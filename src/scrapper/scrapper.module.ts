import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { ClientModule } from '@/client/client.module';
import { ScrapperResolver } from '@/scrapper/scrapper.resolver';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { SeedService } from '@/scrapper/seed.service';

@Module({
  imports: [AuthModule, HttpModule, ClientModule],
  providers: [ScrapperService, ScrapperResolver, SeedService],
  exports: [ScrapperService],
})
export class ScrapperModule {}
