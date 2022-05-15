import { User } from '@/user/user.entity';

import { makeFakeUser } from '!/collaborators/makeFakeUser';

import { Repository } from 'typeorm';

export const makeUserRepositoryStub = (
  fakeUser = makeFakeUser(),
): Partial<Repository<User>> => ({
  find: jest
    .fn()
    .mockReturnValue([makeFakeUser(), makeFakeUser(), makeFakeUser()]),
  findBy: jest.fn().mockReturnValue([fakeUser]),
  findOneBy: jest.fn().mockReturnValue(fakeUser),
  create: jest.fn().mockReturnValue(fakeUser),
  save: jest.fn().mockReturnValue(fakeUser),
});
