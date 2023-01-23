import { useQuery, gql } from '@apollo/client';
import { tokensPerPage } from 'config';
import { OrderDirection } from 'utils/types';

interface TentativeBidQueryParams {
  first?: number;
  skip?: number;
  orderDirection?: OrderDirection;
}

const tentativeBidsQuery = gql`
  query GetTentativeBids($projectId: ID!) {
    bids(where: { project: $projectId }) {
      id
      amount
      timestamp
      bidderAddress
    }
  }
`;

const useTentativeBids = (projectId: string) => {
  // const first = params?.first || tokensPerPage;
  // const skip = params?.skip || 0;
  // const orderDirection = params?.orderDirection || OrderDirection.ASC;
  // const tokenParams: TentativeBidQueryParams = { first, skip, orderDirection };

  console.log('BIDLIST projectId', projectId)
  const { loading, error, data } = useQuery(tentativeBidsQuery, {
    variables: { projectId: projectId },
    context: { clientName: 'goerli' },
  });

  return {
    loading,
    error,
    data,
  };
};

export default useTentativeBids;
