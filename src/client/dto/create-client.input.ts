import { InputType } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateClientInput implements Partial<Client> {
  @IsString()
  @IsOptional()
  code?: Client['code'];

  @IsString()
  @IsNotEmpty()
  name: Client['name'];
}
