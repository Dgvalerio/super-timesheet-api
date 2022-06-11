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
      }
      project {
        id
      }
      category {
        id
      }
    }
  }
`;
