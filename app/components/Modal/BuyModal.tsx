import {
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  RadioGroup,
  Radio,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { useCallback, useState, useEffect } from 'react'
// import { useAccount, useNetwork, useSigner } from 'wagmi';
import axios from 'axios';
import { now } from 'moment';
import { toast } from 'react-toastify';
import { PriceData } from '../../utils/constants';
import { BigNumber, ethers } from 'ethers';
import { useDappContext } from '../../utils/Context';
import { contractAddresses, polygonMainnetChainId, bscTestnetChainId, tokenAddresses, decimals, bscMainnetChainId } from '../../utils/config';
import tokenContractAbi from '../../assets/abis/Token-abi.json';
import contractAbi from '../../assets/abis/MyAIPayment-abi.json';
import * as solAddr from "./solAddress";

import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount } from '@solana/spl-token';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { useMemo } from "react";
import { useConnection,useWallet,useAnchorWallet } from "@solana/wallet-adapter-react";
const bs58 = require('bs58');


export type BuyModalProps = {
  isOpenBuyModal: boolean,
  onCloseBuyModal(): void,
  // announceText: string,
  // announceLogo: string,
}

// const owner: Keypair = new Keypair();
// const provider = anchor.getProvider();

// const connection: Connection = new Connection(
//   "https://api.devnet.solana.com",
//   "confirmed");
// const idl = JSON.parse(
//   require("fs").readFileSync("../../assets/idls/MyAIPayment.json", "utf8")
// );
// const programId = new PublicKey("2zUiVTAqWHxn7BT3FPcn4L3BNezeUoyKpGuqCbxHjPdp");
// const program = new anchor.Program(idl, programId, provider);

export const getTokenAccount = async (addr: PublicKey, owner: Keypair, connection: Connection) => {
  const TOKEN_MINT = new PublicKey(solAddr.TOKEN_MINT_ADDRESS);
  const tokenList = await connection.getTokenAccountsByOwner(addr, { mint: TOKEN_MINT });

  if (tokenList.value.length > 0) {
    return tokenList.value[0].pubkey;
  } else {
    return await createAssociatedTokenAccount(connection, owner, TOKEN_MINT, addr);
  }
};

const sendToken = async (depositAmount: number, payer: PublicKey, program: anchor.Program, owner: Keypair, connection: Connection) => {
  const paymentAccount = new PublicKey(solAddr.PAYMENT_ACCOUNT);
  const treasuryWallet = new PublicKey(solAddr.TREASURY_WALLET);
  const devWallet01 = new PublicKey(solAddr.DEV_01_WALLET_ADDRESS);
  const devWallet02 = new PublicKey(solAddr.DEV_02_WALLET_ADDRESS);

  const tx = await program.methods
                .sendToken(new anchor.BN(depositAmount * 1000000000))
                .accounts({
                        payer: payer,
                        payment: paymentAccount,
                        payerTokenAccount: await getTokenAccount(payer, owner, connection),
                        treasuryWalletTokenAccount: await getTokenAccount(treasuryWallet, owner, connection),
                        devWallet1TokenAccount: await getTokenAccount(devWallet01, owner, connection),
                        devWallet2TokenAccount: await getTokenAccount(devWallet02, owner, connection),
                        tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

  console.log(tx)

  console.log('Token sent successfully');
};

const BuyModal = ({
  isOpenBuyModal,
  onCloseBuyModal,
  // announceText,
  // announceLogo,
}: BuyModalProps) => {
  // to connect to the smart contracts
  const {connection}=useConnection();
  const {publicKey}=useWallet();
  const anchorwallet=useAnchorWallet();
  console.log(publicKey?.toString())

  const idl: anchor.Idl={"version":"0.1.0","name":"myaipayment","instructions":[{"name":"initialize","accounts":[{"name":"payment","isMut":true,"isSigner":true},{"name":"admin","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"setAdmin","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"newAdmin","type":"publicKey"}]},{"name":"setTokenAddress","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"token","type":"publicKey"}]},{"name":"setTreasuryWallet","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"treasuryWallet","type":"publicKey"}]},{"name":"setDevWallets","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"devWallets","type":{"array":["publicKey",2]}}]},{"name":"setDevFees","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"devFees","type":{"array":["u16",2]}}]},{"name":"setPause","accounts":[{"name":"payment","isMut":true,"isSigner":false},{"name":"admin","isMut":false,"isSigner":true}],"args":[{"name":"paused","type":"bool"}]},{"name":"sendToken","accounts":[{"name":"payer","isMut":true,"isSigner":true},{"name":"payment","isMut":true,"isSigner":false},{"name":"payerTokenAccount","isMut":true,"isSigner":false},{"name":"treasuryWalletTokenAccount","isMut":true,"isSigner":false},{"name":"devWallet1TokenAccount","isMut":true,"isSigner":false},{"name":"devWallet2TokenAccount","isMut":true,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false}],"args":[{"name":"amount","type":"u64"}]}],"accounts":[{"name":"MyAiPayment","type":{"kind":"struct","fields":[{"name":"admin","type":"publicKey"},{"name":"token","type":"publicKey"},{"name":"paused","type":"bool"},{"name":"treasuryWallet","type":"publicKey"},{"name":"devWallets","type":{"array":["publicKey",2]}},{"name":"devFees","type":{"array":["u16",2]}}]}}],"errors":[{"code":6000,"name":"Unauthorized","msg":"The requested operation is not authorized."},{"code":6001,"name":"InvalidTreasuryTokenAccount","msg":"Invalid treasury token account."},{"code":6002,"name":"InvalidDevTokenAccount","msg":"Invalid dev token account."},{"code":6003,"name":"PaymentPaused","msg":"Payment is paused by admin."}]};

  const base58PrivateKey = '3RqwVS5N8gvxfFVP9RJ37sY5yd8LTi6bGMxQUceBpmNdHaU4ePsSPR5zvUhagJVy6GqqMvANotdSYSmHVSkHNXcD';
  // Decode the base58 private key to a Uint8Array
  const privateKey = bs58.decode(base58PrivateKey);
  // Create a Keypair from the secret key
  const owner = Keypair.fromSecretKey(privateKey);

  // a program which will connect to the smart contract
  const program=useMemo(()=>{
      if(anchorwallet){
          const provider=new anchor.AnchorProvider(connection,anchorwallet,anchor.AnchorProvider.defaultOptions())
          return new anchor.Program(idl,new PublicKey("2zUiVTAqWHxn7BT3FPcn4L3BNezeUoyKpGuqCbxHjPdp"),provider)
      }
      return null;
  },[connection,anchorwallet]);
  // const { chain } = useNetwork();
  // const { data: signer } = useSigner();
  const [payOption, setPayOption] = useState('4');
  const [imageNum, setImageNum] = useState(10);
  const [chatTime, setChatTime] = useState(1);
  const [price, setPrice] = useState(100);
  // const { address, } = useAccount();
  const [isApproved, setIsApproved] = useState(false);
  const {
    isBuy,
    setIsBuy
  } = useDappContext();

  // useEffect(() => {
  //   if (isOpenBuyModal) {
  //     toast.success('Please click approve button after selecting proper plan');
  //   }
  // }, [isOpenBuyModal])

  useEffect(() => {
    if (payOption == '4') {
      setPrice(imageNum * PriceData[4]);
    } else if (payOption == '5') {
      setPrice(chatTime * PriceData[5]);
    } else {
      setPrice(PriceData[Number(payOption)]);
    }
  }, [payOption, imageNum, chatTime])

  useEffect(() => {
    getExpireDate();
  }, [])

  const getExpireDate = async () => {
    let params = { wallet_address: publicKey?.toString() };
    const response = (await axios.post("/api/account_info/get", params)).data;
    console.log("response: ", response);

    let expire_date = new Date(now());
    let days = 0;
    if (payOption == '1') {
      days = 1;
    } else if (payOption == '2') {
      days = 7;
    } else if (payOption == '3') {
      days = 30;
    }

    expire_date.setDate(expire_date.getDate() + days);
    let UTC_date = expire_date.toISOString();
    return UTC_date;
  }

  const handleBuy = async () => {
    try {
      if (program && publicKey){
        await sendToken(price, publicKey, program, owner, connection);
      }
      console.log('Transfer success')

      await writeBuyDataToDB();

    } catch (e) {
      console.log("error happened: ", e);
    }
  }

  const writeBuyDataToDB = async () => {

    console.log("expired date: ", await getExpireDate());

    let params = {
      type: Number(payOption),
      wallet_address: publicKey?.toString(),
      expire_date: await getExpireDate(),
      price: price
    };
    const response = await axios.post("/api/account_info/buy", params);
    // const response = {"data":"success"}

    if (response.data == "success") {
      toast.success("Buy Success!");
      setIsBuy(true);
    } else {
      toast.error("Buy Failed!");
    }
    onCloseBuyModal();
    setIsApproved(false);
  };

  return (
    <Modal isOpen={isOpenBuyModal} onClose={onCloseBuyModal}>
      {' '}
      <ModalOverlay
        bg='blackAlpha.10'

        backdropFilter='blur(10px) hue-rotate(10deg)'
      />
      <ModalContent
        bg="gray.100"
        border="1px solid #ED2775"
        borderRadius={'15px'}
        color={'black'}
      >
        <ModalCloseButton />
        <ModalBody>
          <Flex
            justifyContent={'center'}
            direction={'column'}
            alignItems={'center'}
            mt={'50px'}
          >
            <Flex
              fontSize={'20px'}
              textAlign={'left'}
              background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
              marginBottom={'30px'}
              letterSpacing={'0.1em'}
              fontWeight={'600'}
              backgroundClip={'text'}
              color={'transparent'}
            >
              Please select pay option.
            </Flex>
            <Flex
              direction={'column'}
              borderTop="1px solid #ED2775"
              padding={'30px'}
            >
              <Flex
                fontSize={'18px'}
                textAlign={'left'}
                background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
                marginBottom={'20px'}
                letterSpacing={'0.1em'}
                fontWeight={'600'}
                backgroundClip={'text'}
                color={'transparent'}
              >
                For Image
              </Flex>
              <RadioGroup onChange={setPayOption} value={payOption}>
                <Stack direction='column'>
                  <Radio value='1' size='lg'>One Day access</Radio>
                  <Radio value='2' size='lg'>One Week access</Radio>
                  <Radio value='3' size='lg'>One Month access</Radio>
                  <Radio value='4' size='lg'>Custom</Radio>
                </Stack>
                {/* <Radio value='4'>Third</Radio> */}
              </RadioGroup>
              <Flex
                direction={'row'}
                alignItems={'center'}
                opacity={payOption != '4' ? '0.5' : '1'}
              >

                AI Image Count
                <NumberInput
                  // defaultValue={10}
                  // max={10}
                  // keepWithinRange={false}
                  // clampValueOnBlur={false}
                  min={10}
                  //@ts-ignore
                  onChange={setImageNum}
                  isDisabled={payOption != '4' ? true : false}
                  width={'100px'}
                  marginLeft={'10px'}
                  value={imageNum}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>

            </Flex>
            <Flex
              direction={'column'}
              borderTop="1px solid #ED2775"
              borderBottom="1px solid #ED2775"
              // borderRadius={'15px'}
              padding={'30px'}
            >
              <Flex
                fontSize={'18px'}
                textAlign={'left'}
                background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
                marginBottom={'20px'}
                letterSpacing={'0.1em'}
                fontWeight={'600'}
                backgroundClip={'text'}
                color={'transparent'}

              >
                For Chat
              </Flex>
              <RadioGroup onChange={setPayOption} value={payOption}>
                <Stack direction='column'>
                  <Radio value='5' size='lg'>Custom</Radio>
                </Stack>
              </RadioGroup>
              <Flex
                direction={'row'}
                alignItems={'center'}
                opacity={payOption != '5' ? '0.5' : '1'}
              >

                Chat MyAI Hours
                <NumberInput
                  // defaultValue={10}
                  // max={10}
                  // keepWithinRange={false}
                  // clampValueOnBlur={false}
                  min={1}
                  //@ts-ignore
                  onChange={setChatTime}
                  isDisabled={payOption != '5' ? true : false}
                  width={'100px'}
                  marginLeft={'10px'}
                  value={chatTime}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>

            </Flex>
            <Text
              marginTop={'20px'}
              fontSize={'20px'}
              fontWeight={'500'}
            >
              Price : {price} MyAI
            </Text>
            <Flex
              direction={'row'}
              alignItems={'center'}
              margin={'20px 0'}
              gap={'20px'}
            >
              <button
                className={'default-btn'}
                onClick={handleBuy}
              >
                Buy
              </button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default BuyModal
