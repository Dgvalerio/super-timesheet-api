import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { makeFakeUser } from '@/common/collaborators/makeFakeUser';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { Repository } from 'typeorm';

const UserRepositoryStub: Partial<Repository<User>> = {
  find: jest
    .fn()
    .mockReturnValue([makeFakeUser(), makeFakeUser(), makeFakeUser()]),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: UserRepositoryStub,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(3);
      expect(UserRepositoryStub.find).toHaveBeenCalledTimes(1);
    });
  });
});
