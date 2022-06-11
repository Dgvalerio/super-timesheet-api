import { GetProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeGetProjectQuery = (input: GetProjectInput) => {
  if (input.id)
    return gql`
      query {
        getProject(input: { id: "${input.id}" }) {
          id
          code
          name
          startDate
          endDate
          client {
            id
          }
        }
      }
    `;
  if (input.code)
    return gql`
      query {
        getProject(input: { code: "${input.code}" }) {
          id
          code
          name
          startDate
          endDate
          client {
            id
          }
        }
      }
    `;

  return gql`
    query {
      getProject(input: {}) {
        id
        code
        name
        startDate
        endDate
        client {
          id
        }
      }
    }
  `;
};
