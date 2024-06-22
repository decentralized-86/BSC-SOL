import {
  Button,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { useAccount, useBalance, useNetwork } from 'wagmi';
// import { bscMainnetChainId, bscTestnetChainId, tokenAddresses } from '../../utils/config';
import BuyModal from '../Modal/BuyModal'
// import { useDappContext } from '../../utils/Context';
// import { usePhantomWallet } from "./usePhantomWallet";
import dynamic from 'next/dynamic';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from '@solana/wallet-adapter-react';
import { useDappContext } from '../../utils/Context';

// const WalletMultiButtonDynamic = dynamic(
//   async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
//   { ssr: false }
// );


const Account = () => {
  // const { connectWallet, disconnectWallet, publicKey } = usePhantomWallet();
  // const onClick = async () => {
  //   if (!publicKey) {
  //     await connectWallet();
  //   } else {
  //     await disconnectWallet();
  //   }
  // };

  // return <button onClick={onClick}>Connect Wallet</button>;

  const { publicKey } = useWallet();

  const {
    isOpen: isOpen,
    onOpen: onOpen,
    onClose: onClose,
  } = useDisclosure();


  const {
    status, setStatus
  } = useDappContext();
  return (
    <>
      <Flex>
        {(() => {
          if (publicKey) {
            return (
              <>
                <Flex
                  gap={['5px', '10px', '20px', '20px', '20px', '20px']}
                  alignItems={'center'}
                >
                  <Flex
                    color={'white'}
                    fontSize={['12px', '14px', '16px', '18px']}
                    fontWeight="500px"
                    lineHeight={'25px'}
                    textAlign={'center'}
                    className={'sticky-font'}
                  >

                    {status}
                  </Flex>

                  {/* <div>{status}</div> */}
                  <Button
                    onClick={onOpen}
                    fontWeight="500px"
                    width={['50px', '80px', '80px', '80px']}
                    borderRadius={'35px'}
                    fontSize={['12px', '14px', '16px', '18px']}
                    height={['35px', '35px', '35px', '41px']}
                    color={'white'}
                    border="1px solid #ED2775"
                    backgroundColor={'transparent'}
                    className={'sticky-font'}
                    _hover={{
                      backgroundColor: '#ED2775',
                    }}
                    _active={{
                      backgroundColor: 'transparent',
                    }}
                  >
                    Buy
                  </Button>
                </Flex >
                <BuyModal
                  isOpenBuyModal={isOpen}
                  onCloseBuyModal={onClose}
                />
              </>
              // </Flex >
            );
          }
          return (
            <>
            </>
          );
        })()}
        <WalletMultiButton />
      </Flex>
    </>
  )
};

export default Account;