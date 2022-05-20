import { apolloClient } from '!/collaborators/apolloClient';

import { DocumentNode } from 'apollo-boost';
import { GraphQLError } from 'graphql';

export const shouldThrowIfUnauthenticated = (
  action: 'query' | 'mutation',
  node: DocumentNode,
) => {
  it('should throw if unauthenticated', async () => {
    let out;

    switch (action) {
      case 'query':
        out = apolloClient.query({ query: node });
        break;
      case 'mutation':
        out = apolloClient.mutate({ mutation: node });
        break;
    }

    const { graphQLErrors } = await out.catch((e) => e);

    expect(graphQLErrors[0].message).toBe('Unauthorized');
    expect(graphQLErrors[0].extensions).toHaveProperty('response');
    expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
  });
};

export const shouldThrowIfEnterAEmptyParam = (
  param: string,
  errors: GraphQLError,
) => {
  expect(errors[0].message).toBe('Bad Request Exception');
  expect(errors[0].extensions).toHaveProperty('response');

  const { response } = errors[0].extensions;

  expect(response.statusCode).toBe(400);
  expect(response.message[0]).toBe(`${param} should not be empty`);
  expect(response.error).toBe('Bad Request');
};
