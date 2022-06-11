import { AddProjectInput } from '@/user/dto/add-project.input';

import { gql } from 'apollo-boost';

export const makeAddProjectMutation = (input: Partial<AddProjectInput>) => {
  if (input.userId) {
    if (input.projectId) {
      return gql`
        mutation {
          addProject(input: {
            userId: "${input.userId}"
            projectId: "${input.projectId}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    } else if (input.projectCode) {
      return gql`
        mutation {
          addProject(input: {
            userId: "${input.userId}"
            projectCode: "${input.projectCode}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addProject(input: {
            userId: "${input.userId}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    }
  } else if (input.userEmail) {
    if (input.projectId) {
      return gql`
        mutation {
          addProject(input: {
            userEmail: "${input.userEmail}"
            projectId: "${input.projectId}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    } else if (input.projectCode) {
      return gql`
        mutation {
          addProject(input: {
            userEmail: "${input.userEmail}"
            projectCode: "${input.projectCode}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addProject(input: {
            userEmail: "${input.userEmail}"
          }) {
            id
            name
            email
            dailyHours
            projects {
              id
            }
          }
        }
      `;
    }
  }

  return gql`
    mutation {
      addProject(input: {}) {
        id
        name
        email
        dailyHours
        projects {
          id
        }
      }
    }
  `;
};
