import {
    Flex,
    Text,
    Image,
    Button,
    Input,
    Select,
} from '@chakra-ui/react';
import axios from 'axios';
import { GeneratorStyleData, UnlimitedTokenAmount } from "../../../utils/constants";
import { useDappContext } from '../../../utils/Context'
import { lockIcon, shapeIcon } from '../../../utils/images'
// import { sleep } from '../../../utils/interface';
import { toast } from 'react-toastify'
// import { useAccount, useBalance, useNetwork } from 'wagmi';
import { useState, useEffect, useMemo } from 'react'
import { now } from 'moment';
// import { polygonMainnetChainId, bscTestnetChainId, tokenAddresses, bscMainnetChainId } from '../../../utils/config';
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from '@solana/web3.js';
import { TOKEN_MINT_ADDRESS } from '../../Modal/solAddress';

const GeneratorStyleContainer = () => {
    const {
        styleId, setStyleId,
        shapeId, setShapeId,
        sizeOption, setSizeOption,
        styleText, setStyleText,
        prediction, setPrediction,
        isBuy, setIsBuy,
        status, setStatus
    } = useDappContext();
    // const { address, } = useAccount();
    const { publicKey } = useWallet();
    const [freeImageAmount, setFreeImageAmount] = useState(0);
    const [paidImageAmount, setPaidImageAmount] = useState(0);
    const [expireDate, setExpireDate] = useState(now());
    // const { chain } = useNetwork();
    // const chainId = chain?.id != undefined ? chain.id :
    //     process.env.NEXT_PUBLIC_MAINNET_OR_TESTNET == "mainnet" ? bscMainnetChainId : bscTestnetChainId;

    // const { data: balanceOfToken, isError, isLoading } = useBalance({
    //     address: address,
    //     // @ts-ignore
    //     token: tokenAddresses[chainId],
    // })
    const { connection } = useConnection();
    const [tokenBalance, setTokenBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const balance = await getTokenBalance();
                console.log("Token Balance: " + balance)
                setTokenBalance(balance);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };

        fetchBalance();

        console.log("Use Effect");
        console.log(tokenBalance);
    }, [publicKey]);

    useEffect(() => {
        if (publicKey) {
            checkUser();
        }
    }, [publicKey]);


    const getTokenBalance = async () => {
        if (publicKey) {
            const TOKEN_MINT = new PublicKey(TOKEN_MINT_ADDRESS);
            const tokenList = await connection.getTokenAccountsByOwner(publicKey, { mint: TOKEN_MINT });

            if (tokenList.value.length > 0) {
                const info = await connection.getTokenAccountBalance(tokenList.value[0].pubkey);
                if (!info.value.uiAmount)
                    return 0
                return info.value.uiAmount;
            }
            else {
                return 0;
            }
        } else {
            return 0;
        }
    };

    useEffect(() => {
        if (publicKey) {
            getInfoData();
        }
    }, []);

    useEffect(() => {
        if (publicKey) {
            getInfoData();
        }
    }, [publicKey, isBuy]);

    const getExpireDate = () => {
        let expire_date = new Date(now());
        let days = 1;
        expire_date.setDate(expire_date.getDate() + days);
        let UTC_date = expire_date.toISOString();
        return UTC_date;
    }

    useEffect(() => {
        if (publicKey && tokenBalance >= UnlimitedTokenAmount) {
            setStatus("Unlimited Access");
            setExpireDate(Date.parse(getExpireDate()));
            checkUser()
        }
    }, [publicKey]);

    const checkUser = async () => {
        let params = { wallet_address: publicKey?.toString() };
        const response = await axios.post("/api/account_info/get", params);
        if (!(response.data.free_image_amount >= 0)) {
            await axios.post("/api/account_info/signup", params);
        }
    }

    const minsToTimeInfo = (mins: number) => {
        return "Left " + Math.floor(mins / 60) + " hours: " + mins % 60 + " mins";
    }

    const getInfoData = async () => {
        let params = { wallet_address: publicKey?.toString() };

        const tokenBalance = await getTokenBalance();

        await axios.post("/api/account_info/get", params)
            .then(response => {
                setFreeImageAmount(response.data.free_image_amount);
                setPaidImageAmount(response.data.paid_image_amount);
                setExpireDate(Date.parse(response.data.expire_date));

                if (publicKey && tokenBalance >= UnlimitedTokenAmount) {
                    setStatus("Unlimited Access");
                    setExpireDate(Date.parse(getExpireDate()));
                } else if (Date.parse(response.data.expire_date) > now()) {
                    setStatus(minsToTimeInfo(Math.floor((Date.parse(response.data.expire_date) - now()) / 60000)));
                } else if (response.data.paid_image_amount > 0) {
                    setStatus(response.data.paid_image_amount + " images left");
                } else if (response.data.free_image_amount >= 0) {
                    setStatus(response.data.free_image_amount + " images left");
                }
            })
            .catch(error => {
                console.log(error);
            });
        if (isBuy) {
            setIsBuy(false);
        }
    };

    const imageGenerate = async () => {
        // e.preventDefault();
        // axios.post()
        if (publicKey) {
            // if (GeneratorStyleData[styleId].isLocked == true && styleId > 9) {
            //     if (paidImageAmount > 0 || expireDate >= now()) {
            //         const response = await fetch("/api/replicate_predictions", {
            //             method: "POST",
            //             headers: {

            //                 "Content-Type": "application/json",
            //             },
            //             body: JSON.stringify({
            //                 prompt: GeneratorStyleData[styleId].prompt + " " + styleText,
            //             }),
            //         });

            //         let tempPrediction = await response.json();
            //         if (response.status !== 201) {
            //             if (tempPrediction.detail.includes("free time limit")) {
            //                 toast.error("Your free time is over.")
            //             } else {
            //                 toast.error(tempPrediction.detail)
            //             }
            //             return;
            //         }

            //         setPrediction(tempPrediction);
            //         while (
            //             tempPrediction.status !== "succeeded" &&
            //             tempPrediction.status !== "failed"
            //         ) {
            //             await sleep(1000);
            //             const response = await fetch("/api/replicate_predictions/" + tempPrediction.id);
            //             tempPrediction = await response.json();
            //             if (response.status !== 200) {
            //                 toast.error(tempPrediction.detail)
            //                 return;
            //             }
            //             setPrediction(tempPrediction);
            //         }

            //         if (expireDate >= now()) {

            //         } else if (paidImageAmount > 0) {
            //             let params = { wallet_address: publicKey.toString(), type: 1 };
            //             await axios.post("/api/account_info/generated", params);
            //         }

            //     } else {
            //         toast.error("Please buy images with MyAi token.")
            //     }

            // } else {
            if (freeImageAmount > 0 || paidImageAmount > 0 || expireDate >= now()) {
                let params = { prompt: GeneratorStyleData[styleId].prompt + " " + styleText, size: sizeOption == "" ? "medium" : sizeOption };
                try {
                    let inititalPrediction = { status: 'processing' };
                    setPrediction(inititalPrediction);
                    const response = await axios.post("/api/openAI_predictions", params);
                    let tempPrediction = response.data;
                    tempPrediction.output = [tempPrediction.imageUrl];
                    setPrediction(tempPrediction);
                    // removeSpinner();
                    if (expireDate >= now()) {

                    } else if (freeImageAmount > 0) {
                        let params = { wallet_address: publicKey.toString(), type: 1 };
                        await axios.post("/api/account_info/generated", params);
                        getInfoData();
                    } else if (paidImageAmount > 0) {
                        let params = { wallet_address: publicKey.toString(), type: 2 };
                        await axios.post("/api/account_info/generated", params);
                        getInfoData();
                    }

                } catch (error) {
                    // removeSpinner();
                    console.log(error);
                    setPrediction({});
                    //@ts-ignore*
                    toast.error(error.response.data.message)
                }
            } else {
                toast.error("Please buy images with MyAi token.")
            }
            // }
        } else {
            toast.error("Please connect wallet to generate the image.")
        }
    };

    return (
        <Flex
            direction='column'
            width={['100%', '100%', '100%', '100%', '59%']}
            padding={['15px', '15px', '15px', '15px', '15px']}
        // margin={'auto'}
        >
            {/* <Flex
                marginTop={'25px'}
                marginBottom={'15px'}
            >
                <Flex
                    fontSize={'18px'}
                    textAlign={'left'}
                    background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
                    marginBottom={'10px'}
                    letterSpacing={'0.1em'}
                    fontWeight={'600'}
                    backgroundClip={'text'}
                    color={'transparent'}
                >
                    Choose a size.
                </Flex>
            </Flex>
            <Flex
            // direction={'column'}
            // alignItems={'center'}
            >
                <Select
                    variant='outline'
                    // placeholder='Size Option'
                    boxShadow={'unset !important'}
                    cursor={'pointer'}
                    width={'80%'}
                    _focus={{
                        border: '1px solid #ED2775 !important',
                    }}
                    color={'#262A37'}
                    onChange={e => { setSizeOption(e.currentTarget.value); }}
                >
                    <option value='small'>Small (256px) </option>
                    <option value='medium'>Medium (512px) </option>
                    <option value='large'>Large (1024px)</option>
                    <option value='option4'>Large (1024)</option> 
                    </Select> 
        </Flex > */}

            < Flex
                marginTop={'25px'}
                marginBottom={'10px'}
            >
                <Flex
                    fontSize={'18px'}
                    textAlign={'left'}
                    background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
                    marginBottom={'10px'}
                    letterSpacing={'0.1em'}
                    fontWeight={'600'}
                    backgroundClip={'text'}
                    color={'transparent'}
                >
                    Choose a style.
                </Flex>
            </Flex >

            <Flex
                // maxWidth={'945px'}
                // margin={'auto'}
                flexWrap={'wrap'}
                justifyContent={'center'}
            >
                {
                    GeneratorStyleData.map((item, index) => (
                        <Flex
                            key={index}
                            position={'relative'}
                            width={'fit-content'}
                            onClick={() => setStyleId(index)}
                            cursor={styleId == index ? 'default' : 'pointer'}
                            padding={'10px'}
                            direction={'column'}
                            alignItems={'center'}

                        >
                            <Image
                                src={item.src}
                                minWidth={'100px'}
                                width={'100px'}
                                height={'auto'}
                                borderRadius={'12px'}
                                filter={item.isLocked && (paidImageAmount <= 0 && expireDate <= now()) ? 'blur(2px)' : 'none'}
                                boxShadow={styleId == index ? '0px 0px 7px 3px #ED2775' : ''}
                                transform={styleId == index ? 'scale(1.1)' : ''}
                                transition={'.3s'}
                                _hover={{
                                    transform: 'scale(1.1)'
                                }}
                            />

                            {
                                (item.isLocked && (paidImageAmount <= 0 && expireDate <= now())) ?
                                    (
                                        <Image
                                            src={lockIcon}
                                            width={'30px'}
                                            height={'30px'}
                                            position={'absolute'}
                                            top={'72px'}
                                            left={'75px'}
                                        />) : (<></>)
                            }
                            <Text
                                color={'#262A37'}
                                fontSize={'16px'}
                                fontWeight={'600'}
                                maxWidth={'110px'}
                                textAlign={'center'}
                                paddingTop={'10px'}
                            >
                                {item.description}
                            </Text>

                        </Flex>
                    ))
                }

            </Flex>

            {/* <Flex
                direction='column'
            >
                <Flex
                    marginTop={'25px'}
                >
                    <Flex
                        fontSize={'18px'}
                        textAlign={'left'}
                        background={'linear-gradient(44.44deg, #ED2775 7.79%, #FF7448 94.18%)'}
                        marginBottom={'10px'}
                        letterSpacing={'0.1em'}
                        fontWeight={'600'}
                        backgroundClip={'text'}
                        color={'transparent'}
                    >
                        Choose a style.
                    </Flex>
                </Flex>

                <Flex
                    flexWrap={'wrap'}
                    justifyContent={'center'}
                    alignItems='center'
                >
                    {
                        GeneratorShapeData.map((item, index) => (
                            <Flex
                                key={index}
                                width={item.width * 2 + "px"}
                                height={item.height * 2 + "px"}
                                margin={'10px'}
                                onClick={() => setShapeId(index)}
                                cursor={shapeId == index ? 'default' : 'pointer'}
                                border={'1px solid #A0AEC0'}
                                boxShadow={shapeId == index ? '0px 0px 7px 3px #ED2775' : ''}
                            >
                                <Image
                                    src={shapeIcon}
                                    width={'100%'}
                                    height={'100%'}
                                    objectFit={'cover'}
                                    overflow={'hidden'}
                                />
                            </Flex>
                        ))
                    }

                </Flex>
            </Flex> */}


            <Flex
                direction={'column'}
                alignItems={'center'}
                mt={'20px'}
            >
                <button
                    className={'default-btn'}
                    onClick={imageGenerate}
                >
                    Generate
                </button>
            </Flex>
        </Flex >
    )
}

export default GeneratorStyleContainer;