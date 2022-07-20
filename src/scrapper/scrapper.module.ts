import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { CategoryModule } from '@/category/category.module';
import { ClientModule } from '@/client/client.module';
import { ProjectModule } from '@/project/project.module';
import { ScrapperResolver } from '@/scrapper/scrapper.resolver';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { SeedService } from '@/scrapper/seed.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    ClientModule,
    ProjectModule,
    UserModule,
    CategoryModule,
  ],
  providers: [ScrapperService, ScrapperResolver, SeedService],
  exports: [ScrapperService],
})
export class ScrapperModule {}
