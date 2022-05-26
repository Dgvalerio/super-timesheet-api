import { gql } from 'apollo-boost';

export const makeGetAllClientsQuery = () => gql`
  query {
    getAllClients {
      id
      code
      name
      projects {
        id
        code
        name
        startDate
        endDate
      }
    }
  }
`;
