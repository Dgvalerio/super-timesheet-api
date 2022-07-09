import { AddProjectToUserInput } from '@/project/dto/add-project-to-user.input';

import { gql } from 'apollo-boost';

export const makeAddProjectMutation = (
  input: Partial<AddProjectToUserInput>,
) => {
  if (input.userId) {
    if (input.projectId) {
      return gql`
        mutation {
          addProjectToUser(input: {
            userId: "${input.userId}"
            projectId: "${input.projectId}"
          }) {
            id
          }
        }
      `;
    } else if (input.projectCode) {
      return gql`
        mutation {
          addProjectToUser(input: {
            userId: "${input.userId}"
            projectCode: "${input.projectCode}"
          }) {
            id
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addProjectToUser(input: {
            userId: "${input.userId}"
          }) {
            id
          }
        }
      `;
    }
  } else if (input.userEmail) {
    if (input.projectId) {
      return gql`
        mutation {
          addProjectToUser(input: {
            userEmail: "${input.userEmail}"
            projectId: "${input.projectId}"
          }) {
            id
          }
        }
      `;
    } else if (input.projectCode) {
      return gql`
        mutation {
          addProjectToUser(input: {
            userEmail: "${input.userEmail}"
            projectCode: "${input.projectCode}"
          }) {
            id
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addProjectToUser(input: {
            userEmail: "${input.userEmail}"
          }) {
            id
          }
        }
      `;
    }
  }

  return gql`
    mutation {
      addProjectToUser(input: {}) {
        id
      }
    }
  `;
};
