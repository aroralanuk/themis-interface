import {
  useQuery,
  gql
} from '@apollo/client';

const testQuery = (id: string) => `
  query GetProject {
    project (
      id: "${id.toLowerCase()}"
    ) {
      id
      mintActive
      owner
      auctionStart
      bidDeadline
      revealDeadline
    }`;

const projectQuery = (id: string) => `
  query GetProject {
    project(
      id: "${id.toLowerCase()}"
    ) {
      id
      projectId
      name
      description
      license
      locked
      pricePerTokenInWei
      active
      paused
      complete
      artistName
      invocations
      maxInvocations
      scriptJSON
      currencyAddress
      currencySymbol
      createdAt
      activatedAt
      tokens (first:1 orderBy: createdAt orderDirection: desc) {
        id
        tokenId
        invocation
      }
      minterConfiguration {
        basePrice
        startPrice
        priceIsConfigured
        currencySymbol
        currencyAddress
        startTime
        endTime
      }
    }
  }`;

const useProject = (id: string) => {
  console.log('useProject', id);
  const { loading, error, data } = useQuery(gql(projectQuery(id)));

  console.log(data);
  return {
    loading,
    error,
    data,
  }
}

export default useProject;
