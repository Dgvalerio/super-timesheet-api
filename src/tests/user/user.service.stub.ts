import { makeFakeUser } from '@/tests/collaborators/makeFakeUser';
import { UserService } from '@/user/user.service';

export const makeUserServiceStub = (
  fakeUser = makeFakeUser(),
): Partial<UserService> => ({
  createUser: jest.fn().mockReturnValue(fakeUser),
  getAllUsers: jest
    .fn()
    .mockReturnValue([makeFakeUser(), makeFakeUser(), makeFakeUser()]),
  getUser: jest.fn().mockReturnValue(fakeUser),
});
