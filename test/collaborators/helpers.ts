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

type ShouldThrowHelperParams =
  | {
      graphQLErrors: GraphQLError;
      predictedError: 'Bad Request';
      messages: string[];
    }
  | {
      graphQLErrors: GraphQLError;
      predictedError: 'Conflict';
      messages: string;
    }
  | {
      graphQLErrors: GraphQLError;
      predictedError: 'Not Found';
      messages: string;
    };

export const shouldThrowHelper = ({
  graphQLErrors,
  predictedError,
  messages,
}: ShouldThrowHelperParams) => {
  const { message, extensions } = graphQLErrors[0];

  expect(extensions).toHaveProperty('response');

  const { statusCode, error, message: errorMessages } = extensions.response;

  switch (predictedError) {
    case 'Bad Request':
      expect(message).toBe('Bad Request Exception');
      expect(statusCode).toBe(400);
      expect(error).toBe('Bad Request');

      messages.forEach((message) => expect(errorMessages).toContain(message));

      if (errorMessages.length !== messages.length) {
        errorMessages.forEach((message) => expect(messages).toContain(message));
      }

      break;
    case 'Not Found':
      expect(message).toBe(messages);
      expect(statusCode).toBe(404);
      expect(error).toBe('Not Found');
      break;
    case 'Conflict':
      expect(message).toBe(messages);
      expect(statusCode).toBe(409);
      expect(error).toBe('Conflict');
      break;
  }
};
