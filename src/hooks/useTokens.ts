import {
  useQuery,
  gql
} from '@apollo/client';
import { tokensPerPage } from 'config';
import { OrderDirection } from 'utils/types';

interface TokensQueryParams {
  first?: number;
  skip?: number;
  orderDirection?: OrderDirection;
}

const tokensQuery = gql`
  query GetTokens($projectId: ID!, $first: Int!) {
    tokens(
      first: $first,
      skip: 0,
      orderBy: createdAt orderDirection: asc,
      where: {
        project: $projectId
      }
    ) {
      id
      tokenId
      invocation
    }
  }`;


const useTokens = (projectId: string, params: TokensQueryParams) => {
  const first = params?.first || tokensPerPage;
  const skip = params?.skip || 0;
  const orderDirection = params?.orderDirection || OrderDirection.ASC;
  const tokenParams: TokensQueryParams = { first, skip, orderDirection };

  const { loading, error, data } = useQuery(tokensQuery, {
    variables: { projectId: projectId, ...tokenParams },
    context: { clientName: 'mumbai' },
  });

  return {
    loading,
    error,
    data,
  }
}

export default useTokens;
