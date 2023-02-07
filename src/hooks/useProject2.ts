import { useQuery, gql } from '@apollo/client';

const testQuery = gql`
  query GetProject ($id: ID!) {
    projects(id: $id) {
      id
      name
      mintActive
      owner
      auctionStart
      bidDeadline
      revealDeadline
    }
  }
`;


export const useProject2 = (id: string) => {
    console.log('useProject2', id);
    const { loading: loading2, error: error2, data: data2 } = useQuery(testQuery, {
        variables: { id },
        context: { clientName: 'goerli' },
    });

    console.log(data2);
    return {
        loading2,
        error2,
        data2,
    };
};
