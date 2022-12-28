import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, polygonMumbai } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClientProvider, QueryClient } from 'react-query';
import {
  metaMask,
  metaMaskHooks,
  walletConnect,
  walletConnectHooks,
  coinbaseWallet,
  coinbaseWalletHooks,
} from 'utils/connectors';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
import theme from 'theme';
import { graphQLURL } from 'config';

const queryClient = new QueryClient();

const connectors2: [MetaMask | WalletConnect | CoinbaseWallet, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
]

const { chains, provider } = configureChains(
  [goerli, polygonMumbai],
  [infuraProvider({ apiKey: process.env.INFURA_API_KEY || "something" }),
    publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Themis',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const client = new ApolloClient({
  uri: graphQLURL,
  cache: new InMemoryCache(),
});

interface Props {
  children: React.ReactNode;
}

const AppProvider = ({ children }:Props) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Web3ReactProvider connectors={connectors2}>
          <QueryClientProvider client={queryClient}>
            <ApolloProvider client={client}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
              </ThemeProvider>
            </ApolloProvider>
          </QueryClientProvider>
        </Web3ReactProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default AppProvider;
