import { InputType } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetClientInput implements Partial<Client> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: Client['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: Client['name'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: Client['code'];
}
