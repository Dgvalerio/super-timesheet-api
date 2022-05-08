import { InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateClientInput {
  @IsString()
  @IsNotEmpty()
  name: string;
}
