import {
  useQuery,
  gql
} from '@apollo/client';



const projectQuery =  gql`
  query GetProject($id: ID!) {
    project(
      id: $id
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

export const useProject = (id: string) => {
  console.log('useProject', id);
  const { loading, error, data } = useQuery(projectQuery, {
    variables: { id },
    context: { clientName: 'mumbai' },
  });

  console.log(data);
  return {
    loading,
    error,
    data,
  }
}

export default useProject;
