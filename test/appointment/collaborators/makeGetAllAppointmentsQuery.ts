import { gql } from 'apollo-boost';

export const makeGetAllAppointmentsQuery = () => gql`
  query {
    getAllAppointments {
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
