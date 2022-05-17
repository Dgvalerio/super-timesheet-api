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
            name
            code
          }
        }
      }
    `;
  if (input.name)
    return gql`
      query {
        getProject(input: { name: "${input.name}" }) {
          id
          code
          name
          startDate
          endDate
          client {
            id
            name
            code
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
            name
            code
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
          name
          code
        }
      }
    }
  `;
};
