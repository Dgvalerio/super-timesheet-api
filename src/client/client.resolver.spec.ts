import { Test, TestingModule } from '@nestjs/testing';

import { ClientResolver } from '@/client/client.resolver';

describe('ClientResolver', () => {
  let resolver: ClientResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientResolver],
    }).compile();

    resolver = module.get<ClientResolver>(ClientResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
