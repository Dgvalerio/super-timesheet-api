import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CookieType {
  name: string;

  value: string;

  domain: string;

  path: string;

  expires: number;

  size: number;

  httpOnly: boolean;

  secure: boolean;

  session: boolean;

  sameSite?: string;

  priority: string;

  sameParty: boolean;

  sourceScheme: string;

  sourcePort: number;

  partitionKey?: string;

  partitionKeyOpaque?: boolean;
}
