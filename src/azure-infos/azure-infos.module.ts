import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { AzureInfosResolver } from '@/azure-infos/azure-infos.resolver';
import { AzureInfosService } from '@/azure-infos/azure-infos.service';

@Module({
  imports: [TypeOrmModule.forFeature([AzureInfos])],
  providers: [AzureInfosService, AzureInfosResolver],
  exports: [AzureInfosService],
})
export class AzureInfosModule {}
