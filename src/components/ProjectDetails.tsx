import { useState } from 'react';
import { Alert, Box, Divider, Grid, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useProject from 'hooks/useProject';
import { useProject2 } from 'hooks/useProject2';
import { useWindowSize } from 'hooks/useWindowSize';
import useTheme from '@mui/material/styles/useTheme';
import TokenPreview from './TokenPreview';
import ProjectStats from './ProjectStats';
import Loading from './Loading';
import TokenList from './TokenList';
import PurchaseProject from './PurchaseProject';
import RevealBid from './RevealBid';
import { parseScriptType, parseAspectRatio } from 'utils/scriptJSON';
import { OrderDirection } from 'utils/types';
import Collapsible from './Collapsible';
import Timer from './Timer';
import { graphQLURL, goerliGraphURL, tokensPerPage } from 'config';

interface Props {
  id: string;
  collectionId: string;
}

interface TitleProps {
  children: any;
}

const Title = ({ children }: TitleProps) => (
  <Typography
    fontSize="12px"
    textTransform="uppercase"
    mb={2}
  >
    { children }
  </Typography>
);

const ProjectDetails = ({ id, collectionId }: Props) => {
  console.log("PROJECT DETAILS - collectionId: ", collectionId);
  const { loading2, error2, data2 } = useProject2(collectionId);
  console.log("PROJECT DETAILS - data2: ", data2);
  const { loading, error, data } = useProject(id);
  const [currentPage, setCurrentPage] = useState(0);
  const [orderDirection, setOrderDirection] = useState(OrderDirection.ASC);
  const size = useWindowSize();
  const theme = useTheme();

  if (data?.project === null) {
    return <Alert severity="error">Project not found</Alert>
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading project
      </Alert>
    )
  }

  const project = data?.project;
  const project2 = data2?.projects[0];

  const token = project?.tokens[0];
  const width = size.width > theme.breakpoints.values.md
    ? (Math.min(size.width, 1200)- 48)*0.666666
      : size.width > theme.breakpoints.values.sm
        ? size.width - 48
        : size.width - 32;

  const {
    description,
    artistName,
    website,
    license,
    paused,
    complete,
    invocations,
    maxInvocations,
    scriptJSON,
  } = project;

  const {
    name,
    bidDeadline,
    revealDeadline,
  } = project2;

  const bidEnd: Date = new Date(Number(bidDeadline) * 1000);
  console.log("BID END :", bidEnd);

  const revealEnd = new Date(Number(revealDeadline) * 1000);

  const currTime = new Date();
  // const beforeBid = !isAuctionInitiated && currTime < bidEnd;
  const isBidPeriod = currTime < bidEnd;

  const isRevealPeriod = currTime > bidEnd && currTime < revealEnd;
    console.log('IS REVEAL PERIOD: ', isRevealPeriod);

  const DeadlineWindow = () => {
    if (isBidPeriod) {
      return (
        <>
          <Typography variant='h6' mt={3}>
            Bid deadline
          </Typography>
          <Timer deadline={bidEnd} />
        </>
      );
    } else if (isRevealPeriod) {
      return (
        <>
          <Typography variant='h6' mt={3}>
            Reveal deadline
          </Typography>
          <Timer deadline={revealEnd} />
          <Box sx={{ fontWeight: 'bold' }}>
            {invocations} / {maxInvocations} revealed
          </Box>
        </>
      );
    } else {
      return (
        <>
          <Typography variant='h6' mt={3}>
            Auction has ended
          </Typography>
          <Box sx={{ fontWeight: 'bold' }}>
            {invocations} / {maxInvocations} revealed
          </Box>
        </>
      );
    }
  }

  const des =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  return (
    project && (
      <Box>
        <Breadcrumbs aria-label='breadcrumb' sx={{ marginBottom: 4 }}>
          <Link href='/' underline='hover' sx={{ color: '#666' }}>
            Home
          </Link>
          <Typography>{name}</Typography>
        </Breadcrumbs>

        <Grid spacing={2} container>
          {project.tokens?.length > 0 && (
            <Grid item md={8}>
              <TokenPreview
                id={token.id}
                tokenId={token.tokenId}
                invocation={token.invocation}
                aspectRatio={parseAspectRatio(scriptJSON)}
                width={width}
                showImageLink
                showLiveViewLink
              />
            </Grid>
          )}

          <Grid item md={4} xs={12} sm={12}>
            <Box sx={{ width: '100%', paddingLeft: [0, 0, 2] }}>
              <ProjectStats paused={paused} complete={complete} startTime={project?.minterConfiguration?.startTime} />

              <Typography variant='h4' mt={3}>
                {name}
              </Typography>

              <Typography variant='h6' mb={2}>
                Mike Hunt
                {/* {artistName} */}
              </Typography>

              <Divider sx={{ display: ['none', 'block', 'none'], marginBottom: 2 }} />

              <DeadlineWindow/>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 3,
                }}
              >
                {/* <LinearProgress
                  sx={{ width: 'calc(100% - 48px)' }}
                  value={(invocations / maxInvocations) * 100}
                  variant='determinate'
                />
                <Box sx={{ fontSize: 12 }}>{Math.floor((invocations / maxInvocations) * 100)} %</Box> */}
              </Box>
              {isRevealPeriod && <RevealBid collection={project2} />}
              {isBidPeriod || <PurchaseProject project={project} />}
            </Box>
          </Grid>
        </Grid>

        <Grid spacing={2} container mt={4} pb={4}>
          <Grid item md={7} sm={12} xs={12}>
            <Typography variant='h6' mb={2}>
              About <b>{name}</b>
            </Typography>
            <Box paddingRight={[0, 0, 4]}>
              <Collapsible content={des} />
            </Box>

            <Box sx={{ display: 'flex', marginTop: 4 }}>
              <Box mr={6}>
                <Title>License</Title>
                <Typography>{license}</Typography>
              </Box>

              <Box>
                <Title>Library</Title>
                <Typography>{parseScriptType(scriptJSON)}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item md={5} sm={12} xs={12}>
            <Box display='flex' mb={4}>
              {false && (
                <Button
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none', marginRight: 4 }}
                  onClick={() => window.open(website)}
                >
                  Artist link
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider />

        <Box px={1}>
          <Box mt={4} mb={4} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h4'>
              Showing {invocations} / {maxInvocations} bid{Number(invocations) === 1 ? '' : 's'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel variant='standard' htmlFor='uncontrolled-native'>
                    Sort
                  </InputLabel>
                  <NativeSelect
                    value={orderDirection}
                    sx={{ fontSize: '14px' }}
                    onChange={(e) => {
                      setCurrentPage(0);
                      setOrderDirection(e.target.value as OrderDirection);
                    }}
                  >
                    <option value={OrderDirection.DESC}>Latest</option>
                    <option value={OrderDirection.ASC}>Earliest</option>
                  </NativeSelect>
                </FormControl>
              </Box>

              <Typography fontSize='14px' pt={2} ml={3}>
                Showing {Math.min(invocations, tokensPerPage)}
              </Typography>
            </Box>
          </Box>

          <TokenList
            projectId={id}
            collectionId={collectionId}
            first={tokensPerPage}
            skip={currentPage * tokensPerPage}
            orderDirection={orderDirection}
            aspectRatio={parseAspectRatio(scriptJSON)}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Stack mt={6} mb={8} spacing={2}>
              <Pagination
                count={Math.ceil(invocations / tokensPerPage)}
                color='primary'
                page={currentPage + 1}
                onChange={(event, page) => {
                  window.scrollTo(0, 0);
                  setCurrentPage(page - 1);
                }}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    )
  );
}

export default ProjectDetails;
