import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { ClientResolver } from '@/client/client.resolver';
import { ClientService } from '@/client/client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [ClientService, ClientResolver],
  exports: [ClientService],
})
export class ClientModule {}
