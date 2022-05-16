import { AuthOutput } from '@/auth/dto/auth.output';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { DeleteUserInput } from '@/user/dto/delete-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { User } from '@/user/user.entity';
import { randWord } from '@ngneat/falso';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import {
  apolloAuthorizedClient,
  apolloClient,
} from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';
import { makeDeleteUserMutation } from '!/user/collaborators/makeDeleteUserMutation';
import { makeGetAllUsersQuery } from '!/user/collaborators/makeGetAllUsersQuery';
import { makeGetUserQuery } from '!/user/collaborators/makeGetUserQuery';

import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';

describe('Graphql User Module (e2e)', () => {
  describe('createUser', () => {
    const makeOut = async (input: Partial<CreateUserInput>) =>
      apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(input),
      });

    it('should throw if enter a empty name', async () => {
      const createUserInput = makeCreateUserInput();

      createUserInput.name = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('name should not be empty');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty and invalid email', async () => {
      const createUserInput = makeCreateUserInput();

      createUserInput.email = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('email should not be empty');
      expect(response.message[1]).toBe('email must be an email');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty and invalid password', async () => {
      const createUserInput = makeCreateUserInput();

      createUserInput.password = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('password should not be empty');
      expect(response.message[1]).toBe(
        'password must be longer than or equal to 8 characters',
      );
      expect(response.error).toBe('Bad Request');
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

      expect(graphQLErrors[0].message).toBe('Esse email já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });

  describe('getAllUsers', () => {
    let user: User;
    let client: ApolloClient<NormalizedCacheObject>;

    const makeOut = async () =>
      client.query<{ getAllUsers: User[] }>({
        query: makeGetAllUsersQuery(),
      });

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(createUserInput),
      });

      const {
        data: {
          login: { token },
        },
      } = await apolloClient.mutate<{ login: AuthOutput }>({
        mutation: makeLoginMutation({
          email: createUserInput.email,
          password: createUserInput.password,
        }),
      });

      client = apolloAuthorizedClient(token);
      user = createUser;
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getAllUsers: User[] }>({
        query: makeGetAllUsersQuery(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
    let client: ApolloClient<NormalizedCacheObject>;

    const makeOut = async (input: Partial<GetUserInput>) =>
      client.query<{ getUser: User }>({
        query: makeGetUserQuery(input),
      });

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(createUserInput),
      });

      const {
        data: {
          login: { token },
        },
      } = await apolloClient.mutate<{ login: AuthOutput }>({
        mutation: makeLoginMutation({
          email: createUserInput.email,
          password: createUserInput.password,
        }),
      });

      client = apolloAuthorizedClient(token);
      user = createUser;
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ createUser: User }>({
        query: makeGetUserQuery({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe(
        'Nenhum parâmetro válido foi informado',
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

    it('should get and show user by name', async () => {
      const { data } = await makeOut({ name: user.name });

      expect(data).toHaveProperty('getUser');
      expect(data.getUser).toEqual({
        __typename: 'User',
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should throw if not found user', async () => {
      const out = makeOut({ name: `${randWord()}_${user.email}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum usuário foi encontrado');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });

  describe('deleteUser', () => {
    let user: User;
    let client: ApolloClient<NormalizedCacheObject>;

    const makeOut = async (input: Partial<DeleteUserInput>) =>
      client.mutate<{ deleteUser: boolean }>({
        mutation: makeDeleteUserMutation(input),
      });

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      await apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(createUserInput),
      });

      const {
        data: {
          login: { token },
        },
      } = await apolloClient.mutate<{ login: AuthOutput }>({
        mutation: makeLoginMutation({
          email: createUserInput.email,
          password: createUserInput.password,
        }),
      });

      client = apolloAuthorizedClient(token);
    });

    beforeEach(async () => {
      const createUserInput = makeCreateUserInput();

      const { data } = await apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(createUserInput),
      });

      user = data.createUser;
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.mutate<{ deleteUser: boolean }>({
        mutation: makeDeleteUserMutation({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
      expect(data).toBeTruthy();
    });

    it('should delete user by email', async () => {
      const { data } = await makeOut({ email: user.email });

      expect(data).toHaveProperty('deleteUser');
      expect(data).toBeTruthy();
    });

    it('should throw if not found user', async () => {
      const out = makeOut({ email: `${randWord()}_${user.email}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O usuário informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });
});
