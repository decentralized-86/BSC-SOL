import '../styles/globals.css'
import { useMemo } from "react";
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
// import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
// import {
//   injectedWallet,
//   metaMaskWallet,
//   rainbowWallet,
//   trustWallet,
//   walletConnectWallet,
// } from '@rainbow-me/rainbowkit/wallets';
// import '@rainbow-me/rainbowkit/styles.css';
// import { configureChains, createClient, goerli, mainnet, WagmiConfig } from 'wagmi';
// import {
//   avalanche,
//   avalancheFuji,
//   bsc,
//   bscTestnet,
//   fantomTestnet,
//   polygon,
//   polygonMumbai,
// } from 'wagmi/chains';
// import { publicProvider } from 'wagmi/providers/public';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import sal from 'sal.js'
import './../node_modules/sal.js/dist/sal.css'
import Head from 'next/head'

import '../public/css/bootstrap.min.css'
import '../public/css/remixicon.css'
import '../public/css/styles.css'
import Layout from '../components/_App/Layout';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

require("@solana/wallet-adapter-react-ui/styles.css");

// import dynamic from "next/dynamic";
// const WalletConnectionProvider=dynamic(()=>import("./WalletContextProvider"),{
//   ssr:false,
// });

// const { chains, provider, webSocketProvider } = configureChains(
//   [
//     ...(process.env.NEXT_PUBLIC_MAINNET_OR_TESTNET == "mainnet" ? [
//       // mainnet,
//       bsc,
//       // polygon,
//       // avalanche,
//     ] : [
//       // goerli,
//       bscTestnet,
//       //polygonMumbai,
//       // avalancheFuji,
//     ])
//   ],
//   [
//     publicProvider(),
//   ]
// );

// const { connectors } = getDefaultWallets({
//   appName: 'RainbowKit demo',
//   chains,
// });

// const connectors = connectorsForWallets([
//   {
//     groupName: 'Recommended',
//     wallets: [
//       injectedWallet({ chains }),
//       rainbowWallet({ /*projectId,*/ chains }),
//       walletConnectWallet({ /*projectId,*/ chains }),
//       metaMaskWallet({ chains }),
//       trustWallet({ chains }),
//     ],
//   },
// ]);

// const wagmiClient = createClient({
//   autoConnect: true,
//   connectors,
//   provider,
//   webSocketProvider,
// });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sal({ threshold: 0.1, once: true } as any)
  }, [router.asPath])

  useEffect(() => {
    sal()
    setReady(true);
  }, [])

  // const network = clusterApiUrl('devnet');
  // const wallets = [new PhantomWalletAdapter()];
  const solNetwork = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // new SolflareWalletAdapter({ solNetwork }),
      // new TorusWalletAdapter(),
      // new LedgerWalletAdapter(),
    ],
    [solNetwork]
  );


  return (
    <>
      <Head>
        <link rel="shortcut icon" href="images/logo.png" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Inter&family=Nunito&display=swap');
        </style>

        <title>MyAi | Image | Chat MyAI</title>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MyAi Website" />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:image:url" content="/images/logo.png" />
        <meta property="og:image:alt" content="Visit MyAI Website" />
        <meta property="og:title" content="MyAi Website" />
        <meta property="og:description" content="Integrate AI to The Blockchain. Integrating and synchronizing OpenAI, GPT3, GPT4, Bing, text to AI imaging generation engine on OpenAI Low cost API and website where MyAi token owners able to generate AI Images for free and mint them as high quality NFT as an exclusive owners. MyAi Dapp developed by Lucas Iwai" />

      </Head>
      {
        ready ? (
          <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets}>
            <WalletModalProvider>
            <ChakraProvider>
                <Layout>
                  <Component {...pageProps} />
                  <ToastContainer position="top-center" />
                </Layout>
              </ChakraProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
          
      //   <WalletConnectionProvider>
      //   <Component {...pageProps}/>
      // </WalletConnectionProvider>
          //<WagmiConfig client={wagmiClient}>
            // <ConnectionProvider endpoint={network}>
            //   <WalletProvider wallets={wallets} autoConnect>
            //     <WalletModalProvider>
            //       <Component {...pageProps}/>
            //     </WalletModalProvider>
            //   </WalletProvider>
            // </ConnectionProvider>
          //</WagmiConfig>
          // <WagmiConfig client={wagmiClient}>
          //   <RainbowKitProvider chains={chains}>
          //     <ChakraProvider>
          //       <Layout>
          //         <Component {...pageProps} />
          //         <ToastContainer position="top-center" />
          //       </Layout>
          //     </ChakraProvider>
          //   </RainbowKitProvider>
          // </WagmiConfig>
        ) : null
      }
    </>
  )
}

export default MyApp
