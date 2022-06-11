import { AddCategoryInput } from '@/project/dto/add-category.input';

import { gql } from 'apollo-boost';

export const makeAddCategoryMutation = (input: Partial<AddCategoryInput>) => {
  if (input.projectId) {
    if (input.categoryId) {
      return gql`
        mutation {
          addCategory(input: {
            projectId: "${input.projectId}"
            categoryId: "${input.categoryId}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else if (input.categoryCode) {
      return gql`
        mutation {
          addCategory(input: {
            projectId: "${input.projectId}"
            categoryCode: "${input.categoryCode}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else if (input.categoryName) {
      return gql`
        mutation {
          addCategory(input: {
            projectId: "${input.projectId}"
            categoryName: "${input.categoryName}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addCategory(input: {
            projectId: "${input.projectId}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    }
  } else if (input.projectCode) {
    if (input.categoryId) {
      return gql`
        mutation {
          addCategory(input: {
            projectCode: "${input.projectCode}"
            categoryId: "${input.categoryId}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else if (input.categoryCode) {
      return gql`
        mutation {
          addCategory(input: {
            projectCode: "${input.projectCode}"
            categoryCode: "${input.categoryCode}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else if (input.categoryName) {
      return gql`
        mutation {
          addCategory(input: {
            projectCode: "${input.projectCode}"
            categoryName: "${input.categoryName}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    } else {
      return gql`
        mutation {
          addCategory(input: {
            projectCode: "${input.projectCode}"
          }) {
            id
            code
            name
            startDate
            endDate
            client {
              id
            }
            categories {
              id
            }
          }
        }
      `;
    }
  }

  return gql`
    mutation {
      addCategory(input: {}) {
        id
        code
        name
        startDate
        endDate
        client {
          id
        }
        categories {
          id
        }
      }
    }
  `;
};
