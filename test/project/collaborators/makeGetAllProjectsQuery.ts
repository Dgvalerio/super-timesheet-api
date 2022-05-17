import { gql } from 'apollo-boost';

export const makeGetAllProjectsQuery = () => gql`
  query {
    getAllProjects {
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
