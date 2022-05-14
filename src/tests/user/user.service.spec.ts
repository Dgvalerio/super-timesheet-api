import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { makeFakeUser } from '@/tests/collaborators/makeFakeUser';
import { makeUserRepositoryStub } from '@/tests/user/user.repository.stub';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { Repository } from 'typeorm';

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

  describe('getUsers', () => {
    it('should return an user by id', async () => {
      const fakeUser = makeFakeUser();

      const { userService, userRepository } = await makeSut(fakeUser);

      const users = await userService.getUser({ id: fakeUser.id });

      expect(users).toBe(fakeUser);
      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: fakeUser.id,
      });
    });

    it('should return an user by name', async () => {
      const fakeUser = makeFakeUser();

      const { userService, userRepository } = await makeSut(fakeUser);

      const users = await userService.getUser({ name: fakeUser.name });

      expect(users).toBe(fakeUser);
      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        name: fakeUser.name,
      });
    });

    it('should return an user by email', async () => {
      const fakeUser = makeFakeUser();

      const { userService, userRepository } = await makeSut(fakeUser);

      const users = await userService.getUser({ email: fakeUser.email });

      expect(users).toBe(fakeUser);
      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.email,
      });
    });
  });

  describe('createUser', () => {
    it('should throws if email has already been used', async () => {
      const { userService, userRepository } = await makeSut();

      const fakeUser = makeFakeUser();

      await expect(userService.createUser(fakeUser)).rejects.toThrow(
        new ConflictException('Esse email já foi utilizado!'),
      );

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.email,
      });
    });

    it('should throws if user is not created', async () => {
      const fakeUser = makeFakeUser();

      const { userService, userRepository } = await makeSut(fakeUser);

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockReturnValueOnce(Promise.resolve(null));

      jest.spyOn(userRepository, 'save').mockReturnValueOnce(null);

      await expect(userService.createUser(fakeUser)).rejects.toThrow(
        new InternalServerErrorException(
          'Houve um problema ao cadastrar um usuário',
        ),
      );

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.email,
      });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(fakeUser);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(fakeUser);
    });

    it('should create, save and return an user', async () => {
      const fakeUser = makeFakeUser();

      const { userService, userRepository } = await makeSut(fakeUser);

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockReturnValueOnce(Promise.resolve(null));

      const user = await userService.createUser(fakeUser);

      expect(user).toBe(fakeUser);
      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.email,
      });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(fakeUser);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(fakeUser);
    });
  });
});
