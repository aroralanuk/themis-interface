import { useState } from 'react';
import { Collection } from 'utils/types';
import { CHAINS } from 'utils/chains';
import { Alert, Box, Button, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { notifyTx } from 'utils/notifications';
import { useWeb3React } from '@web3-react/core';
import { expectedChainId, coreAuctionAddress } from 'config';
import { ThemisAuction__factory } from 'contracts';
import { ThemisAuction } from 'contracts';
import { ethers, utils, BigNumber } from 'ethers';
import useTentativeBids from 'hooks/useTentativeBids';

interface Props {
  collection: Collection;
}


const RevealBid = ({ collection }: Props) => {
  const { chainId, isActive, account, connector, provider } = useWeb3React();
  const [pending, setPending] = useState(false);
  const [salt, setSalt] = useState<string>('');

  const accountMerkleProof = [ethers.utils.hexlify('0x000001'), ethers.utils.hexlify('0x000002'),];

  const {
    loading: loadingBids,
    error: errorBids,
    data: dataBids,
  } = useTentativeBids(collection.id);

  console.log('bid list: ', dataBids);

  const parseAmt = (bn: any) => {
    return BigNumber.from(bn.amount);
  }

  const findInsertLimits = (sortedBids: any, bidAmount: BigNumber) => {
    if (sortedBids?.length === 0) {
      return { left: 0, right: 0 };
    } else if (parseAmt(sortedBids[0]) < bidAmount) {
      console.log('gt ', sortedBids[0].id);
      return { left: 0, right: sortedBids[0].id };
      }
    else {
      for (let i = 0; i < sortedBids.length - 1; i++) {
        if (parseAmt(sortedBids[i]) >= bidAmount && parseAmt(sortedBids[i + 1]) <= bidAmount) {
          return { left: sortedBids[i].id, right: sortedBids[i + 1].id };
        }
      }
      return { left: sortedBids[sortedBids.length - 1].id, right: 0}
    }
  }

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const enteredName = event.target.value;
    setSalt(enteredName);
  };

  const revealBidAction = async (salt: any) => {
    if (provider && coreAuctionAddress) {
      console.log('revealBid - auction address: ', coreAuctionAddress);
      const signer = provider.getSigner(account);

      const auctionContract = ThemisAuction__factory.connect(coreAuctionAddress, signer);

      const _saltNum = ethers.BigNumber.from(salt);
      const _salt = ethers.utils.hexZeroPad(_saltNum.toHexString(), 32);

      const token = auctionContract.collateralToken();
      // TODO: get proof
      let proof: ThemisAuction.CollateralizationProofStruct = {
        accountMerkleProof: accountMerkleProof,
        blockHeaderRLP: ethers.utils.hexlify('0x00000000'),
      };



      console.log('bidder', signer._address);
      console.log('salt', _salt);
      // console.log('proof', proof);

      const vaultAddress = await auctionContract.getVaultAddress(auctionContract.address, token, signer._address, _salt);
      const localBidAmount = JSON.parse(localStorage.getItem(vaultAddress) || '0').bidAmount;

      // const sortedBids = dataBids?.sort((a: any, b: any) => b.amount - a.amount);
      console.log("REVEAL-BID highestBids: ", dataBids.projects[0].highestBids);

      const { left, right } = findInsertLimits(dataBids.projects[0].highestBids, localBidAmount);
      console.log('REVEAL-BID left', left);
      console.log('REVEAL-BID right', right);

      const gasLimit = await auctionContract.estimateGas.revealBid(
        signer._address,
        _salt,
        BigNumber.from(left),
        BigNumber.from(right),
        proof
      );

      return auctionContract.revealBid(signer._address, _salt, BigNumber.from(left), BigNumber.from(right), proof, { gasLimit });
    }
    return Promise.reject(new Error('Auction contract or provider not properly configured'));
  }

  const reveal = () => {
    if (!provider || !coreAuctionAddress) {
      return;
    }
    notifyTx({
      method: () => revealBidAction(salt),
      chainId: expectedChainId,
      success: 'Your reveal has been requested',
      error: 'An error occured while requesting reveal',
      onSuccess: (receipt: any) => {
        console.log('receipt', receipt);
        const tokenId = parseInt(receipt?.events[0]?.topics[3], 16);
        setPending(false);
      },
      onSubmitted: () => setPending(true),
      onError: () => setPending(false),
    });
  };

  if (!collection) {
    return null;
  }

  // if (!isRevealPeriod) {
  //   return <Alert severity='info'>Project is not active</Alert>;
  // }

  if (chainId !== expectedChainId) {
    return (
      <Alert severity='warning'>
        Switch to {CHAINS[expectedChainId]?.name} to purchase
      </Alert>
    );
  }

  const RevealBidBox = () => {
    return (
      <Box
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
          onChange={inputHandler}

        />
        <Button variant='contained' color='primary' onClick={reveal}>
          Reveal Bid
        </Button>
        ;
      </Box>
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
        ) : <RevealBidBox />
    }
    </>
  )
};

export default RevealBid;
