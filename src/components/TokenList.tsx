import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { tokensPerPage } from 'config';
import useTokens from 'hooks/useTokens';
import useTentativeBids from 'hooks/useTentativeBids';
import Loading from './Loading';
import { OrderDirection, Token, Bid } from 'utils/types';
import { useWindowSize } from 'hooks/useWindowSize';
import useTheme from '@mui/material/styles/useTheme';
import TokenImage from './TokenImage';
import { goerliscanBaseUrl } from 'config';

interface Props {
  projectId: string;
  collectionId: string;
  first?: number;
  skip?: number;
  orderDirection?: OrderDirection;
  aspectRatio?: number;
}

const TokenList = ({
  projectId,
  collectionId,
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
  } = useTentativeBids(collectionId);

  console.log("TOKEN-LIST - collection: ", dataBids);
  const highestBids = dataBids?.projects[0]?.highestBids;
  console.log('TOKEN-LIST - bid list: ', highestBids);

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
    dataBids &&
    dataBids.projects &&
    dataBids.projects[0] &&
    dataBids.projects[0].highestBids &&
    (highestBids.length > 0 ? (
      <Grid spacing={2} container>
        {highestBids.map((bid: Bid) => {
          let token = data.tokens.find(
            (token: Token) => token.invocation.toString() === (highestBids.length - parseInt(bid.id)).toString()
          );
          console.log("TOKEN-LIST: ", typeof token.invocation);
          const addressLink = `${goerliscanBaseUrl}address/${bid.bidder.toString()}`;

          return (
            <Grid key={token.tokenId} item md={4} sm={12} xs={12}>
              <Typography mt={2} fontWeight='bold'>
                Ranking #{(parseInt(token.invocation) + 1).toString()}
              </Typography>
              <Link href={`/token/${token.id}`}>
                <TokenImage tokenId={token.tokenId} aspectRatio={aspectRatio} width={width} />
              </Link>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                  <Avatar src={'https://i.pravatar.cc/300'} sx={{ marginInline: 1.5 }} />
                  <a href={addressLink} target='_blank' style={{ color: 'black' }} rel='noopener noreferrer'>
                    <Typography mt={2}>{bid.bidder.toString().substring(0, 5).concat('...')}</Typography>
                  </a>
                </Box>
                <Typography mt={2}>{(parseInt(bid.amount.toString()) / 1000000).toString()} USDC</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    ) : (
      <Alert severity='info'>No tokens found for this project.</Alert>
    ))
  );
}

export default TokenList;
