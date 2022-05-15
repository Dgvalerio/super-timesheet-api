import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserInput } from '@/user/dto/create-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { UserResolver } from '@/user/user.resolver';
import { UserService } from '@/user/user.service';

import { makeFakeUser } from '!/collaborators/makeFakeUser';
import { makeUserServiceStub } from '!/user/user.service.stub';

namespace Sut {
  export interface Return {
    userResolver: UserResolver;
    userService: UserService;
  }
}

const makeSut = async (fakeUser = makeFakeUser()): Promise<Sut.Return> => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [UserResolver, UserService],
  })
    .overrideProvider(UserService)
    .useValue(makeUserServiceStub(fakeUser))
    .compile();

  return {
    userResolver: module.get<UserResolver>(UserResolver),
    userService: module.get<UserService>(UserService),
  };
};

describe('UserResolver', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', async () => {
    const { userResolver } = await makeSut();

    expect(userResolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should call userService and return a user', async () => {
      const fakeUser = makeFakeUser();
      const input: CreateUserInput = {
        email: fakeUser.email,
        name: fakeUser.name,
        password: fakeUser.password,
      };

      const { userResolver, userService } = await makeSut(fakeUser);

      const user = await userResolver.createUser(input);

      expect(user).toBe(fakeUser);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(userService.createUser).toHaveBeenCalledWith(input);
    });
  });

  describe('getAllUsers', () => {
    it('should call userService and return all users', async () => {
      const { userResolver, userService } = await makeSut();

      const users = await userResolver.getAllUsers();

      expect(users).toHaveLength(3);
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should call userService and return a user', async () => {
      const fakeUser = makeFakeUser();
      const input: GetUserInput = { id: fakeUser.id };

      const { userResolver, userService } = await makeSut(fakeUser);

      const user = await userResolver.getUser(input);

      expect(user).toBe(fakeUser);
      expect(userService.getUser).toHaveBeenCalledTimes(1);
      expect(userService.getUser).toHaveBeenCalledWith(input);
    });
  });
});
