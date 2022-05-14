import { AuthOutput } from '@/auth/dto/auth.output';
import { makeLoginMutation } from '@/tests/collaborators/makeLoginMutation';

import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
import fetch from 'cross-fetch';

describe('Graphql Auth Module (e2e)', () => {
  let app: ApolloClient<any>;

  beforeAll(async () => {
    app = new ApolloClient({
      link: new HttpLink({ uri: 'http://localhost:3001/graphql', fetch }),
      cache: new InMemoryCache(),
    });
  });

  describe('Login', () => {
    const makeOut = async ({
      email = 'dio@genes.com',
      password = '12345678',
    }) => {
      return app.mutate<{ login: AuthOutput }>({
        mutation: makeLoginMutation({ email, password }),
      });
    };

    it('should throw if enter a invalid email', async () => {
      const out = makeOut({ email: 'invalid-email' });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions.response.message[0]).toBe(
        'email must be an email',
      );
    });

    it('should throw if enter a email of invalid user', async () => {
      const out = makeOut({ email: 'never@created.com' });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum usuário foi encontrado');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(404);
      expect(graphQLErrors[0].extensions.response.error).toBe('Not Found');
    });

    it('should throw if enter a invalid password', async () => {
      const out = makeOut({
        email: 'dio@genes.com',
        password: '12344321',
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Senha incorreta!');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
      expect(graphQLErrors[0].extensions.response.error).toBe('Unauthorized');
    });

    it('should authenticate with valid email and password', async () => {
      const { data } = await makeOut({});

      expect(data).toHaveProperty('login');
      expect(data.login).toHaveProperty('user');
      expect(data.login.user).toBeDefined();
      expect(data.login).toHaveProperty('token');
      expect(data.login.token).toBeDefined();
    });
  });
});
