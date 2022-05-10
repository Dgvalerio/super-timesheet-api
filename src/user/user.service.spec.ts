import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { makeFakeUser } from '@/common/collaborators/makeFakeUser';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { Repository } from 'typeorm';

const makeUserRepositoryStub = (): Partial<Repository<User>> => {
  class UserRepositoryStub implements Partial<Repository<User>> {
    user = makeFakeUser();

    find = jest
      .fn()
      .mockReturnValue([makeFakeUser(), makeFakeUser(), makeFakeUser()]);

    findBy = jest.fn().mockReturnValue([this.user]);
  }

  return new UserRepositoryStub();
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: makeUserRepositoryStub(),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(3);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should throws if email has already been used', async () => {
      const fakeUser = makeFakeUser();

      await expect(userService.createUser(fakeUser)).rejects.toThrow(
        new ConflictException('Esse email já foi utilizado!'),
      );

      expect(userRepository.findBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        email: fakeUser.email,
      });
    });
  });
});
