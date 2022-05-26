import { GetClientInput } from '@/client/dto/get-client.input';

import { gql } from 'apollo-boost';

export const makeGetClientQuery = (input: GetClientInput) => {
  if (input.id)
    return gql`
      query {
        getClient(input: { id: "${input.id}" }) {
          id
          code
          name
          projects {
            id
            code
            name
            startDate
            endDate
          }
        }
      }
    `;
  if (input.name)
    return gql`
      query {
        getClient(input: { name: "${input.name}" }) {
          id
          code
          name
          projects {
            id
            code
            name
            startDate
            endDate
          }
        }
      }
    `;
  if (input.code)
    return gql`
      query {
        getClient(input: { code: "${input.code}" }) {
          id
          code
          name
          projects {
            id
            code
            name
            startDate
            endDate
          }
        }
      }
    `;

  return gql`
    query {
      getClient(input: {}) {
        id
        code
        name
        projects {
          id
          code
          name
          startDate
          endDate
        }
      }
    }
  `;
};
