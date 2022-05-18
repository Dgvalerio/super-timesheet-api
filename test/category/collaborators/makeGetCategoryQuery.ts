import { GetClientInput } from '@/client/dto/get-client.input';

import { gql } from 'apollo-boost';

export const makeGetCategoryQuery = (input: GetClientInput) => {
  if (input.id)
    return gql`
      query {
        getCategory(input: { id: "${input.id}" }) {
          id
          code
          name
        }
      }
    `;
  if (input.name)
    return gql`
      query {
        getCategory(input: { name: "${input.name}" }) {
          id
          code
          name
        }
      }
    `;
  if (input.code)
    return gql`
      query {
        getCategory(input: { code: "${input.code}" }) {
          id
          code
          name
        }
      }
    `;

  return gql`
    query {
      getCategory(input: {}) {
        id
        code
        name
      }
    }
  `;
};
