import { Client } from '@/client/client.entity';
import { AddProjectToUserInput } from '@/project/dto/add-project-to-user.input';
import { Project } from '@/project/project.entity';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { DeleteUserInput } from '@/user/dto/delete-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { User } from '@/user/user.entity';
import { randWord } from '@ngneat/falso';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { randId } from '!/collaborators/randMore';
import { makeCreateProjectInput } from '!/project/collaborators/makeCreateProjectInput';
import { makeCreateProjectMutation } from '!/project/collaborators/makeCreateProjectMutation';
import { makeAddProjectMutation } from '!/user/collaborators/makeAddProjectMutation';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';
import { makeDeleteUserMutation } from '!/user/collaborators/makeDeleteUserMutation';
import { makeGetAllUsersQuery } from '!/user/collaborators/makeGetAllUsersQuery';
import { makeGetUserQuery } from '!/user/collaborators/makeGetUserQuery';

describe('Graphql User Module (e2e)', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => {
    await api.authenticate();
  });

  describe('createUser', () => {
    const apiUnAuth = new ApolloClientHelper();

    const makeOut = async (input: Partial<CreateUserInput>) =>
      apiUnAuth.mutation<{ createUser: User }>(makeCreateUserMutation(input));

    it('should throw if enter a empty name', async () => {
      const out = makeOut({ ...makeCreateUserInput(), name: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
    });

    it('should throw if enter a empty dailyHours', async () => {
      const input = makeCreateUserInput();

      delete input.dailyHours;

      const out = makeOut(input);

      const { statusCode, result } = await out.catch((e) => e.networkError);

      expect(statusCode).toBe(400);
      expect(result.errors[0].message).toBe(
        'Float cannot represent non numeric value: undefined',
      );
    });

    it('should throw if enter dailyHours less than 1', async () => {
      const out = makeOut({ ...makeCreateUserInput(), dailyHours: 0 });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['dailyHours must not be less than 1'],
      });
    });

    it('should throw if enter dailyHours greater than 24', async () => {
      const out = makeOut({ ...makeCreateUserInput(), dailyHours: 25 });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['dailyHours must not be greater than 24'],
      });
    });

    it('should throw if enter a empty and invalid email', async () => {
      const out = makeOut({ ...makeCreateUserInput(), email: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('email', graphQLErrors);
      expect(graphQLErrors[0].extensions.response.message[1]).toBe(
        'email must be an email',
      );
    });

    it('should throw if enter a empty and invalid password', async () => {
      const out = makeOut({ ...makeCreateUserInput(), password: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('password', graphQLErrors);
      expect(graphQLErrors[0].extensions.response.message[1]).toBe(
        'password must be longer than or equal to 8 characters',
      );
    });

    it('should throw if enter a empty and invalid passwordConfirmation', async () => {
      const out = makeOut({
        ...makeCreateUserInput(),
        passwordConfirmation: '',
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('passwordConfirmation', graphQLErrors);
      expect(graphQLErrors[0].extensions.response.message[1]).toBe(
        'passwordConfirmation must be longer than or equal to 8 characters',
      );
    });

    it('should throw if enter a passwordConfirmation different of password', async () => {
      const input = makeCreateUserInput();

      input.passwordConfirmation = input.password + randWord();

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['A confirma????o de senha deve ser igual ?? senha!'],
      });
    });

    it('should create an user', async () => {
      const createUserInput = makeCreateUserInput();

      const { data } = await makeOut(createUserInput);

      expect(data).toHaveProperty('createUser');

      expect(data.createUser).toEqual({
        __typename: 'User',
        id: expect.anything(),
        name: createUserInput.name,
        email: createUserInput.email,
        dailyHours: createUserInput.dailyHours,
      });
    });

    it('should fail if you enter an email that has already been registered', async () => {
      const {
        data: {
          createUser: { email },
        },
      } = await makeOut(makeCreateUserInput());

      const createUserInput = makeCreateUserInput();

      createUserInput.email = email;

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Conflict',
        messages: 'Esse email j?? foi utilizado!',
      });
    });
  });

  describe('getAllUsers', () => {
    let user: User;

    const makeOut = async () =>
      api.query<{ getAllUsers: User[] }>(makeGetAllUsersQuery());

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await api.mutation<{ createUser: User }>(
        makeCreateUserMutation(createUserInput),
      );

      user = createUser;
    });

    shouldThrowIfUnauthenticated('query', makeGetAllUsersQuery());

    it('should get and list all users', async () => {
      const { data } = await makeOut();

      expect(data).toHaveProperty('getAllUsers');

      expect(Array.isArray(data.getAllUsers)).toBeTruthy();
      expect(data.getAllUsers.length >= 1).toBeTruthy();
      expect(data.getAllUsers.find(({ id }) => user.id === id)).toEqual({
        __typename: 'User',
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });

  describe('getUser', () => {
    let user: User;

    const makeOut = async (input: Partial<GetUserInput>) =>
      api.query<{ getUser: User }>(makeGetUserQuery(input));

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await api.mutation<{ createUser: User }>(
        makeCreateUserMutation(createUserInput),
      );

      user = createUser;
    });

    shouldThrowIfUnauthenticated('query', makeGetUserQuery({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe(
        'Nenhum par??metro v??lido foi informado',
      );
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad Request');
    });

    it('should get and show user by id', async () => {
      const { data } = await makeOut({ id: user.id });

      expect(data).toHaveProperty('getUser');
      expect(data.getUser).toEqual({
        __typename: 'User',
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should get and show user by email', async () => {
      const { data } = await makeOut({ email: user.email });

      expect(data).toHaveProperty('getUser');
      expect(data.getUser).toEqual({
        __typename: 'User',
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should throw if not found user', async () => {
      const out = makeOut({ id: randId() });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum usu??rio foi encontrado');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });

  describe('deleteUser', () => {
    let user: User;

    const makeOut = async (input: Partial<DeleteUserInput>) =>
      api.mutation<{ deleteUser: boolean }>(makeDeleteUserMutation(input));

    beforeEach(async () => {
      const createUserInput = makeCreateUserInput();

      const { data } = await api.mutation<{ createUser: User }>(
        makeCreateUserMutation(createUserInput),
      );

      user = data.createUser;
    });

    shouldThrowIfUnauthenticated('mutation', makeDeleteUserMutation({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.message[0]).toBe('id should not be empty');
      expect(response.message[1]).toBe('id must be a string');
      expect(response.message[2]).toBe('email should not be empty');
      expect(response.message[3]).toBe('email must be an email');

      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad Request');
    });

    it('should delete user by id', async () => {
      const { data } = await makeOut({ id: user.id });

      expect(data).toHaveProperty('deleteUser');
      expect(data.deleteUser).toBeTruthy();
    });

    it('should delete user by email', async () => {
      const { data } = await makeOut({ email: user.email });

      expect(data).toHaveProperty('deleteUser');
      expect(data.deleteUser).toBeTruthy();
    });

    it('should throw if not found user', async () => {
      const out = makeOut({ email: `${randWord()}_${user.email}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O usu??rio informado n??o existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });

  describe('addProjectToUser', () => {
    let project: Project;
    let user: User;

    const makeOut = async (input: Partial<AddProjectToUserInput>) =>
      api.mutation<{ addProjectToUser: User }>(makeAddProjectMutation(input));

    beforeEach(async () => {
      const {
        data: { createUser },
      } = await api.mutation<{ createUser: User }>(
        makeCreateUserMutation(makeCreateUserInput()),
      );

      user = createUser;

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation({
          ...makeCreateProjectInput(),
          clientId: createClient.id,
        }),
      );

      delete createProject.categories;
      delete createProject.client;

      project = { ...createProject };
    });

    shouldThrowIfUnauthenticated('mutation', makeAddProjectMutation({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe(
        'Nenhum par??metro v??lido foi informado',
      );
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if not found user', async () => {
      const out = makeOut({
        userId: randId(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O usu??rio informado n??o existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should throw if not found project', async () => {
      const out = makeOut({
        userId: user.id,
        projectCode: `${randWord()}_${project.id}`,
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O projeto informado n??o existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should add project to some user', async () => {
      const { data } = await makeOut({
        userId: user.id,
        projectCode: project.code,
      });

      expect(data).toHaveProperty('addProjectToUser');

      expect(data.addProjectToUser).toEqual({
        __typename: 'User',
        ...user,
        projects: [{ __typename: 'Project', id: project.id }],
      });
    });

    it('should throw if project already be added', async () => {
      const { data } = await makeOut({
        userId: user.id,
        projectCode: project.code,
      });

      expect(data).toHaveProperty('addProjectToUser');

      expect(data.addProjectToUser).toEqual({
        __typename: 'User',
        ...user,
        projects: [{ __typename: 'Project', id: project.id }],
      });

      const out = makeOut({
        userId: user.id,
        projectCode: project.code,
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe(
        'Esse projeto j?? foi adicionado a esse usu??rio!',
      );
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });
});
