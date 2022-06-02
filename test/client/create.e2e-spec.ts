import { Client } from '@/client/client.entity';
import { CreateClientInput } from '@/client/dto/create-client.input';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';

describe('[E2E] Cliente > Create', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<CreateClientInput>) =>
    api.mutation<{ createClient: Client }>(makeCreateClientMutation(input));

  beforeAll(async () => await api.authenticate());

  shouldThrowIfUnauthenticated('mutation', makeCreateClientMutation({}));

  it('should throw if enter a empty name', async () => {
    const out = makeOut({ ...makeCreateClientInput(), name: '' });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
  });

  it('should create an client (without code)', async () => {
    const createClientInput = makeCreateClientInput();

    delete createClientInput.code;

    const { data } = await makeOut(createClientInput);

    expect(data).toHaveProperty('createClient');
    expect(data.createClient).toEqual({
      __typename: 'Client',
      id: expect.anything(),
      name: createClientInput.name,
      projects: [],
    });
  });

  it('should create an client (with code)', async () => {
    const createClientInput = makeCreateClientInput();

    const { data } = await makeOut(createClientInput);

    expect(data).toHaveProperty('createClient');
    expect(data.createClient).toEqual({
      __typename: 'Client',
      id: expect.anything(),
      name: createClientInput.name,
      code: createClientInput.code,
      projects: [],
    });
  });

  it('should fail if entered name already been registered', async () => {
    const { data } = await makeOut(makeCreateClientInput());

    const createClientInput = makeCreateClientInput();

    createClientInput.name = data.createClient.name;

    const out = makeOut(createClientInput);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Conflict',
      messages: 'Esse nome já foi utilizado!',
    });
  });

  it('should fail if entered code already been registered', async () => {
    const a = makeCreateClientInput();

    const { data } = await makeOut(a);

    const createClientInput = makeCreateClientInput();

    createClientInput.code = data.createClient.code;

    const out = makeOut(createClientInput);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Conflict',
      messages: 'Esse código já foi utilizado!',
    });
  });
});
