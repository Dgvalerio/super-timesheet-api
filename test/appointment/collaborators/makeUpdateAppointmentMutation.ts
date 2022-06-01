import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';

import { gql } from 'apollo-boost';

export const makeUpdateAppointmentMutation = (
  input: Partial<UpdateAppointmentInput>,
) => {
  if (input.code || input.code === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          code: "${input.code}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.date) {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          date: "${input.date}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.startTime || input.startTime === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          startTime: "${input.startTime}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.endTime || input.endTime === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          endTime: "${input.endTime}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.notMonetize === true || input.notMonetize === false) {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          notMonetize: ${input.notMonetize}
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.description || input.description === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          description: "${input.description}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.commit || input.commit === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          commit: "${input.commit}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.status) {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          status: ${input.status}
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }

  // Relations
  // User
  if (input.userId || input.userId === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          userId: "${input.userId}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.userEmail || input.userEmail === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          userEmail: "${input.userEmail}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }

  // Project
  if (input.projectId || input.projectId === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          projectId: "${input.projectId}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.projectCode || input.projectCode === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          projectCode: "${input.projectCode}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }

  // Category
  if (input.categoryId || input.categoryId === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          categoryId: "${input.categoryId}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.categoryName || input.categoryName === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          categoryName: "${input.categoryName}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }
  if (input.categoryCode || input.categoryCode === '') {
    return gql`
      mutation {
        updateAppointment(input: {
          id: "${input.id}"
          categoryCode: "${input.categoryCode}"
        }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
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
          category {
            id
            code
            name
          }
        }
      }
    `;
  }

  return gql`
    mutation {
      updateAppointment(input: {
        id: "${input.id}"
      }) {
        id
        code
        date
        startTime
        endTime
        notMonetize
        description
        commit
        status
        user {
          id
          name
          email
        }
        project {
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
        category {
          id
          code
          name
        }
      }
    }
  `;
};
