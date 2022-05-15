import { AuthInput } from '@/auth/dto/auth.input';
import { AuthOutput } from '@/auth/dto/auth.output';
import { User } from '@/user/user.entity';
import { randWord } from '@ngneat/falso';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import { apolloClient } from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

const makeOut = async (input: Partial<AuthInput>) =>
  apolloClient.mutate<{ login: AuthOutput }>({
    mutation: makeLoginMutation({
      email: input.email,
      password: input.password,
    }),
  });

describe('Graphql Auth Module (e2e)', () => {
  let user: User;

  beforeAll(async () => {
    const createUserInput = makeCreateUserInput();

    const { data } = await apolloClient.mutate<{ createUser: User }>({
      mutation: makeCreateUserMutation(createUserInput),
    });

    user = { ...data.createUser, ...createUserInput };
  });

  describe('Login', () => {
    it('should throw if enter a invalid email', async () => {
      const out = makeOut({ email: randWord() });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions.response.message[0]).toBe(
        'email must be an email',
      );
    });

    it('should throw if enter a email of invalid user', async () => {
      const fakeEmail = `${randWord()}_${user.email}`;

      const out = makeOut({ email: fakeEmail });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum usuário foi encontrado');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(404);
      expect(graphQLErrors[0].extensions.response.error).toBe('Not Found');
    });

    it('should throw if enter a invalid password', async () => {
      const out = makeOut({
        email: user.email,
        password: `${randWord()}_${user.password}`,
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Senha incorreta!');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
      expect(graphQLErrors[0].extensions.response.error).toBe('Unauthorized');
    });

    it('should authenticate with valid email and password', async () => {
      const { data } = await makeOut({
        email: user.email,
        password: user.password,
      });

      expect(data).toHaveProperty('login');
      expect(data.login).toHaveProperty('user');

      expect(data.login.user).toEqual({
        __typename: 'User',
        id: expect.anything(),
        name: user.name,
        email: user.email,
      });

      expect(data.login.user).toBeDefined();
      expect(data.login).toHaveProperty('token');
      expect(data.login.token).toBeDefined();
    });
  });
});
