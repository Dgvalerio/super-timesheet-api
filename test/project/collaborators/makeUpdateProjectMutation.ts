import { UpdateProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeUpdateProjectMutation = (
  input: Partial<UpdateProjectInput>,
) => {
  if (input.code || input.code === '')
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
          code: "${input.code}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;
  if (input.name || input.name === '')
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
          name: "${input.name}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;
  if (input.startDate)
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
          startDate: "${input.startDate}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;
  if (input.endDate)
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
          endDate: "${input.endDate}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;
  if (input.clientId || input.clientId === '')
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;
  if (input.clientCode || input.clientCode === '')
    return gql`
      mutation {
        updateProject(input: {
          id: "${input.id}"
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
          categories {
            id
            code
            name
          }
        }
      }
    `;

  return gql`
    mutation {
      updateProject(input: {
        id: "${input.id}"
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
        categories {
          id
          code
          name
        }
      }
    }
  `;
};
