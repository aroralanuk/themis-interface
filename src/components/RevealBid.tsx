import { useState } from 'react';
import { Project } from 'utils/types';
import { CHAINS } from 'utils/chains';
import { Alert, Box, Button, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { notifyTx } from 'utils/notifications';
import { useWeb3React } from '@web3-react/core';
import { expectedChainId, controllerAddress } from 'config';
import { ThemisController__factory } from 'contracts';
import { ThemisController } from 'contracts';
import { ethers, utils, BigNumber } from 'ethers';

interface Props {
    project: Project;
    isRevealPeriod: boolean;
}


const RevealBid = ({project, isRevealPeriod}: Props) => {
  const { chainId, isActive, account, connector, provider } = useWeb3React();
  const [pending, setPending] = useState(false);
  const [salt, setSalt] = useState<string>('');

  const accountMerkleProof = [ethers.utils.hexlify('0x000001'), ethers.utils.hexlify('0x000002'),];

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const enteredName = event.target.value;
    setSalt(enteredName);
  };

  const revealBidAction = async (salt: any) => {
    if (provider && controllerAddress) {
      console.log("revealBid - controller address: ", controllerAddress);
      const signer = provider.getSigner(account);

      const controllerContract = ThemisController__factory.connect(controllerAddress, signer);

      const _saltNum = ethers.BigNumber.from(salt);
      const _salt = ethers.utils.hexZeroPad(_saltNum.toHexString(), 32);

      // TODO: get proof
      let proof: ThemisController.CollateralizationProofStruct = {
        accountMerkleProof: accountMerkleProof,
        blockHeaderRLP: ethers.utils.hexlify("0x00000000")
      };

      const gasLimit = await controllerContract.estimateGas.revealBid(
        signer._address,
        _salt,
        proof
      );

      console.log('bidder', signer._address);
      console.log('salt', _salt);
      console.log('proof', proof);


      return controllerContract.revealBid(signer._address, _salt, proof, { gasLimit });
    }
    return Promise.reject(new Error('Controller contract or provider not properly configured'));
  }

  const reveal = () => {
    if (!provider || !controllerAddress) {
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

  if (!project) {
    return null;
  }

  if (!isRevealPeriod) {
    return <Alert severity='info'>Project is not active</Alert>;
  }

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
