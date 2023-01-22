import { useQuery, gql } from '@apollo/client';

const highestBidsQuery = gql`
  query GetHighestBids($id: String) {
    projects(first: 5) {
      highestBids {
        id
        domain
      }
    }
  }
`;

const useHighestBids = (id: string) => {
  console.log('useHighestBids', id);

  const { loading, error, data } = useQuery(highestBidsQuery, {
    variables: { id },
    context: { clientName: 'goerli' },
  });

  return {
    loading,
    error,
    data,
  };
};

export default useHighestBids;
