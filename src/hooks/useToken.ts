import {
  useQuery,
  gql
} from '@apollo/client';

const tokenQuery = gql`
  query GetToken($id: String) {
    token(
      id: $id
    ) {
      id
      tokenId
      invocation
      createdAt
      uri
      owner {
        id
      }
      project {
        id
        projectId
        name
        artistName
        scriptJSON
      }
    }
  }`;

const useToken = (id: string) => {
  console.log('useToken', id);

    const { loading, error, data } = useQuery(tokenQuery, {
      variables: { id },
      context: { clientName: 'mumbai' },
    });

  return {
    loading,
    error,
    data,
  }
}

export default useToken;
