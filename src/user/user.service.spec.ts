import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { makeFakeUser } from '@/common/collaborators/makeFakeUser';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { Repository } from 'typeorm';

const makeUserRepositoryStub = (
  fakeUser = makeFakeUser(),
): Partial<Repository<User>> => ({
  find: jest
    .fn()
    .mockReturnValue([makeFakeUser(), makeFakeUser(), makeFakeUser()]),
  findBy: jest.fn().mockReturnValue([fakeUser]),
  create: jest.fn().mockReturnValue(fakeUser),
  save: jest.fn().mockReturnValue(fakeUser),
});

namespace Sut {
  export interface Return {
    userService: UserService;
    userRepository: Repository<User>;
  }
}

const makeSut = async (fakeUser = makeFakeUser()): Promise<Sut.Return> => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: getRepositoryToken(User),
        useValue: makeUserRepositoryStub(fakeUser),
      },
    ],
  }).compile();

  return {
    userService: module.get<UserService>(UserService),
    userRepository: module.get<Repository<User>>(getRepositoryToken(User)),
  };
};

describe('UserService', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', async () => {
    const { userService } = await makeSut();

    expect(userService).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const { userService, userRepository } = await makeSut();

      const users = await userService.getAllUsers();

      expect(users).toHaveLength(3);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should throws if email has already been used', async () => {
      const { userService, userRepository } = await makeSut();

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
