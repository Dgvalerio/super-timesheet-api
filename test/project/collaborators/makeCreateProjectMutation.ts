import { CreateProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeCreateProjectMutation = (
  input: Partial<CreateProjectInput>,
) => {
  if (input.code) {
    if (input.clientId)
      return gql`
        mutation {
          createProject(input: {
            code: "${input.code}"
            name: "${input.name}"
            startDate: "${input.startDate}"
            endDate: "${input.endDate}"
            clientId: "${input.clientId}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
              code
              name
            }
          }
        }
      `;
    if (input.clientCode)
      return gql`
        mutation {
          createProject(input: {
            code: "${input.code}"
            name: "${input.name}"
            startDate: "${input.startDate}"
            endDate: "${input.endDate}"
            clientCode: "${input.clientCode}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
              code
              name
            }
          }
        }
      `;

    return gql`
      mutation {
        createProject(input: {
          code: "${input.code}"
          name: "${input.name}"
          startDate: "${input.startDate}"
          endDate: "${input.endDate}"
        }) {
          id
          code
          name
          startDate
        }
      }
    `;
  }

  if (input.clientId)
    return gql`
      mutation {
        createProject(input: {
          name: "${input.name}"
          startDate: "${input.startDate}"
          endDate: "${input.endDate}"
          clientId: "${input.clientId}"
        }) {
          id
          name
          startDate
          endDate
          client {
            id
            code
            name
          }
        }
      }
    `;
  if (input.clientCode)
    return gql`
      mutation {
        createProject(input: {
          name: "${input.name}"
          startDate: "${input.startDate}"
          endDate: "${input.endDate}"
          clientCode: "${input.clientCode}"
        }) {
          id
          name
          startDate
          endDate
          client {
            id
            code
            name
          }
        }
      }
    `;

  return gql`
    mutation {
      createProject(input: {
        name: "${input.name}"
        startDate: "${input.startDate}"
        endDate: "${input.endDate}"
      }) {
        id
        name
        startDate
        endDate
      }
    }
  `;
};
