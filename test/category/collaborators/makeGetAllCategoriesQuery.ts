import { gql } from 'apollo-boost';

export const makeGetAllCategoriesQuery = () => gql`
  query {
    getAllCategories {
      id
      code
      name
    }
  }
`;
