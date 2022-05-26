import { GetUserInput } from '@/user/dto/get-user.input';

import { gql } from 'apollo-boost';

export const makeGetUserQuery = (input: GetUserInput) => {
  if (input.id)
    return gql`
      query {
        getUser(input: { id: "${input.id}" }) {
          id
          email
          name
        }
      }
    `;
  if (input.email)
    return gql`
      query {
        getUser(input: { email: "${input.email}" }) {
          id
          email
          name
        }
      }
    `;

  return gql`
    query {
      getUser(input: {}) {
        id
        email
        name
      }
    }
  `;
};
