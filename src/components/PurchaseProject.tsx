import { useCallback, useState } from 'react';
import { ethers, utils, BigNumber, } from 'ethers';
import moment from 'moment';
import { useWeb3React } from '@web3-react/core';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { FormControl, OutlinedInput, TextField } from '@mui/material';
import Alert from '@mui/material/Alert';
import { ERC20Token, Project } from 'utils/types';
import { CHAINS } from 'utils/chains';
import { notifyTx } from 'utils/notifications';
import { ThemisAuction__factory } from 'contracts';
import MintSuccessDialog from './MintSuccessDialog';
import RequiresBalance from './RequiresBalance';
import ApproveERC20Token from './ApproveERC20Token';
import { expectedChainId, mintContractAddress, coreAuctionAddress } from 'config';
import { ERC20__factory } from 'contracts/factories/ERC20__factory';
import e from 'express';

interface Props {
  project: Project;
}

const PurchaseProject = ({ project }: Props) => {
  console.log('PURCHASE-PROJECT project: ', project);
  const { chainId, isActive, account, connector, provider } = useWeb3React();
  const startTime = project?.minterConfiguration?.startTime && moment.unix(parseInt(project.minterConfiguration?.startTime?.toString()));
  const usesCustomToken = project?.currencyAddress !== ethers.constants.AddressZero;
  const [pending, setPending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [salt, setSalt] = useState('');
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const weiPrice = BigNumber.from(project.pricePerTokenInWei.toString());

  const connect = useCallback(() => {
    if (connector?.activate) {
      connector.activate();
    }
  }, [connector]);

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    // event.preventDefault();
    // const enteredName = event.target.value;
    setBidAmount(event.target.value);
  };

  const commitBidAction = async (bidAmount: any) => {
    if (provider && coreAuctionAddress) {
      const signer = provider.getSigner(account);

      console.log('core contract: ', coreAuctionAddress);
      const auction = ThemisAuction__factory.connect(coreAuctionAddress, signer);
      const collateralToken = await auction.collateralToken();
      const token = ERC20__factory.connect(collateralToken, signer);

      const saltNum = BigNumber.from(salt);
      const saltHex = ethers.utils.hexZeroPad(saltNum.toHexString(), 32);
      console.log('salt: ', saltHex);
      const vaultAddress = await auction.getVaultAddress(auction.address, token.address, signer._address, saltHex);
      console.log('vaultAddress', vaultAddress);

      const amount = BigNumber.from(bidAmount).mul(10 ** 6);
      console.log('bidAmount', amount);

      setBidLocalStorage(vaultAddress, amount, saltHex);
      console.log('localStorage', localStorage.getItem(vaultAddress));
      return token.transfer(vaultAddress, amount, { gasLimit: 1000000 });
    }
    return Promise.reject(new Error('Auction contract or provider not properly configured'));
  };

  const setBidLocalStorage = (vaultAddress: string, bidAmount: BigNumber, salt: string) => {
    if (ethers.utils.isAddress(vaultAddress) === true) {
      const bid = {
        bidAmount: bidAmount,
        salt: salt
      };
      // console.log('bid', bid);
      localStorage.setItem(vaultAddress, JSON.stringify(bid));
    }
  }

  const mint = () => {
    if (!provider || !mintContractAddress) {
      return;
    }
    notifyTx({
      method: () => commitBidAction(bidAmount),
      chainId: expectedChainId,
      success: 'Your bid was commited privately',
      error: 'An error occured while commit bid',
      onSuccess: (receipt: any) => {
        console.log('receipt', receipt);
        const tokenId = parseInt(receipt?.events[0]?.topics[3], 16);
        setMintedTokenId(tokenId);
        setPending(false);
        setSuccessOpen(true);
        setBidSubmitted(true);
      },
      onSubmitted: () => setPending(true),
      onError: () => setPending(false),
    });
  }

  if (!project) {
    return null;
  }

  if (project.paused) {
    return (
      <Button
        variant="contained"
        color="primary"
        disabled
      >
        Purchases paused
      </Button>
    );
  }

  if (startTime && startTime.isAfter()) {
    return <Alert severity="info">Upcoming</Alert>
  }

  if (!project.active) {
    return <Alert severity="info">Project is not active</Alert>
  }

  if (!project.active) {
    return <Alert severity="info">Project is not active</Alert>
  }

  // if (project.complete) {
  //   return <Alert severity="info">Sold out</Alert>
  // }

  if (!isActive) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={connect}
      >
        Connect to purchase
      </Button>
    );
  }

  if (chainId !== expectedChainId) {
    return (
      <Alert severity="warning">
        Switch to {CHAINS[expectedChainId]?.name} to purchase
      </Alert>
    );
  }

  let customToken: ERC20Token;
  if (usesCustomToken) {
    customToken = {
      address: project.currencyAddress,
      decimals: 18,
      symbol: project.currencySymbol,
    }
  }

  const BidButton = () => {
    if (bidSubmitted) {
      return <Button variant='contained' color='primary' onClick={mint}>
        Update bid
      </Button>
    } else {
      return <Button variant='contained' color='primary' onClick={mint}>
        Commit bid anonymously
      </Button>;
    }

  }


  const Mint = () => (
    <Box
      component='form'
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'row',
        marginTop: 2.5,
        marginBottom: 2.5,
      }}
    >
      <TextField
        sx={{ marginRight: 1, width: '25ch' }}
        required
        id='outlined-required'
        label='Required'
        defaultValue={salt}
        onChange={(event) => setSalt(event.target.value)}
      />
      <TextField
        sx={{ marginRight: 1, width: '25ch' }}
        required
        id='outlined-required'
        label='Amount'
        defaultValue={bidAmount}
        onChange={(event) => setBidAmount(event.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position='end'>USDC</InputAdornment>,
        }}
      />
      <BidButton />
    </Box>
  );

  const ApproveAndMint = () => {
    if (!mintContractAddress) {
      return (
        <Alert severity="warning">
          Mint contract not configured
        </Alert>
      );
    }
    return (
      <RequiresBalance
        amount={BigNumber.from(parseInt(String(utils.formatEther(weiPrice))))}
        paymentToken={customToken}
      >
        <ApproveERC20Token
          amount={BigNumber.from(parseInt(String(utils.formatEther(weiPrice))))}
          paymentToken={customToken}
          spendingContractAddress={mintContractAddress}
          approveLabel={`Approve ${project.currencySymbol}`}
          chainId={chainId}
          expectedChainId={expectedChainId}
          useExact={false}
        >
          <Mint />
        </ApproveERC20Token>
      </RequiresBalance>
    );
  }

  return (
    <>
      {
        pending ? (
          <LoadingButton
            loading
            variant="outlined"
            color="primary"
          >
            Purchasing
          </LoadingButton>
        ) : usesCustomToken ? <ApproveAndMint /> : <Mint />
      }
      <MintSuccessDialog
        mintedTokenId={String(mintedTokenId)}
        open={successOpen}
        handleClose={() => {
          setSuccessOpen(false)
        }}
      />
    </>
  )
}

export default PurchaseProject;
