import { Client } from '@/client/client.entity';
import { DeleteClientInput } from '@/client/dto/delete-client.input';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { makeDeleteClientMutation } from '!/client/collaborators/makeDeleteClientMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { randCode } from '!/collaborators/randMore';

describe('[E2E] Client > Delete', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<DeleteClientInput>) =>
    api.mutation<{ deleteClient: Client }>(makeDeleteClientMutation(input));

  beforeAll(async () => await api.authenticate());

  let client: Client;

  beforeEach(async () => {
    const {
      data: { createClient },
    } = await api.mutation<{ createClient: Client }>(
      makeCreateClientMutation(makeCreateClientInput()),
    );

    client = createClient;
  });

  shouldThrowIfUnauthenticated('mutation', makeDeleteClientMutation({}));

  it('should throw if no parameter as entered', async () => {
    const out = makeOut({});

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Bad Request',
      messages: ['Nenhum parâmetro válido foi informado'],
    });
  });

  it('should delete by id', async () => {
    const { data } = await makeOut({ id: client.id });

    expect(data).toHaveProperty('deleteClient');
    expect(data.deleteClient).toBeTruthy();
  });

  it('should delete by code', async () => {
    const { data } = await makeOut({ code: client.code });

    expect(data).toHaveProperty('deleteClient');
    expect(data.deleteClient).toBeTruthy();
  });

  it('should throw if not found client', async () => {
    const out = makeOut({ code: randCode() });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'O cliente informado não existe!',
    });
  });
});
