import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { tokensPerPage } from 'config';
import useTokens from 'hooks/useTokens';
import useTentativeBids from 'hooks/useTentativeBids';
import Loading from './Loading';
import { OrderDirection, Token } from 'utils/types';
import { useWindowSize } from 'hooks/useWindowSize';
import useTheme from '@mui/material/styles/useTheme';
import TokenImage from './TokenImage';

interface Props {
  projectId: string;
  first?: number;
  skip?: number;
  orderDirection?: OrderDirection;
  aspectRatio?: number;
}

const TokenList = ({
  projectId,
  first=tokensPerPage,
  skip=0,
  orderDirection=OrderDirection.ASC,
  aspectRatio=1,
}: Props) => {
  const {loading, error, data } = useTokens(projectId, {
    first,
    skip,
    orderDirection,
  });

  const {
    loading: loadingBids,
    error: errorBids,
    data: dataBids,
  } = useTentativeBids('0xf54ddd35f3adf7d2babab6251d4481a4acba5535');

  console.log("bid list: ", dataBids.bids);

  const size = useWindowSize();
  const theme = useTheme();

  if (loading) {
    return <Loading />
  }

  console.log("TOKEN LIST: ", projectId);

  if (error) {
    return (
      <Alert severity="error">
        Error loading tokens
      </Alert>
    )
  }

  let width = 280;
  const maxColumns = 3;
  if (size && !isNaN(size.width)) {
    width = size.width > theme.breakpoints.values.md
      ? (Math.min(size.width, 1200)- 96)*1/maxColumns
        : size.width > theme.breakpoints.values.sm
          ? size.width - 64
          : size.width - 48
  }

  return (
    data &&
    data.tokens &&
    (data.tokens.length > 0 ? (
      <Grid spacing={2} container>
        {data.tokens.map((token: Token) => (
          <Grid key={token.tokenId} item md={4} sm={12} xs={12}>
            <Typography mt={2}>Your position</Typography>
            <Link href={`/token/${token.id}`}>
              <TokenImage tokenId={token.tokenId} aspectRatio={aspectRatio} width={width} />
            </Link>
            <Typography mt={2} fontWeight='bold'>
              Ranking #{token.invocation.toString()}
            </Typography>
            <Typography mt={2}>Address 0x5486..3 Link</Typography>
            <Typography mt={2}>125 USDC</Typography>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Alert severity='info'>No tokens found for this project.</Alert>
    ))
  );
}

export default TokenList;
