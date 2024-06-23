import {
    Flex, Text, Input, Button
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'
// import { useAccount } from 'wagmi';
import { useWallet } from "@solana/wallet-adapter-react";
import { useDappContext } from '../../utils/Context';

interface ChatProps {
    version: string;
}

const Chat = (props: ChatProps) => {
    const {
        isBuy, setIsBuy,
        status, setStatus
    } = useDappContext();
    // const { address, } = useAccount();
    const { publicKey } = useWallet();

    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi, My Name is MyAi." },
        { role: "assistant", content: "How can I help you?" },
    ]);

    const [inputMessage, setInputMessage] = useState("");
    const [freeChatTime, setFreeChatTime] = useState(0);
    const [paidChatTime, setPaidChatTime] = useState(0);
    const [currentChatTime, setCurrentChatTime] = useState(0);
    const [version, setVersion] = useState<string>();

    useEffect(() => {
        if (publicKey) {
            getInfoData();
        }
    }, []);

    useEffect(() => {
        if (props.version) {
            setVersion(props.version);
        }
        if (props.version != version) {
            setMessages([
                { role: "assistant", content: "Hi, My Name is MyAi." },
                { role: "assistant", content: "How can I help you?" },
            ])
        }
    }, [props]);

    useEffect(() => {
        if (publicKey) {
            getInfoData();
        }
    }, [publicKey, isBuy]);

    const minsToTimeInfo = (mins: number) => {
        return "Left " + Math.floor(mins / 60) + " hours: " + mins % 60 + " mins";
    }

    const getInfoData = async () => {
        let params = {}
        if (publicKey)
            params = { wallet_address: publicKey.toString() };
        await axios.post("/api/account_info/get", params)
            .then(response => {
                setFreeChatTime(response.data.free_chat_time);
                setPaidChatTime(response.data.paid_chat_time);
                if (response.data.paid_chat_time > 0) {
                    setStatus(minsToTimeInfo(response.data.paid_chat_time / 60));
                } else if (response.data.free_chat_time >= 0) {
                    setStatus(minsToTimeInfo(response.data.free_chat_time / 60));
                }
            })
            .catch(error => {
                console.log(error);
            });
        if (isBuy) {
            setIsBuy(false);
        }
    };



    const chatTimeUpdate = async () => {
        if (freeChatTime > 0) {
            let params = { wallet_address: publicKey?.toString(), type: 3 };
            await axios.post("/api/account_info/generated", params);
            getInfoData();
        } else if (paidChatTime > 0) {
            let params = { wallet_address: publicKey?.toString(), type: 4 };
            await axios.post("/api/account_info/generated", params);
            getInfoData();
        }
        setCurrentChatTime(0);
    }
    const handleSendMessage = async () => {

        if (publicKey) {

            if (freeChatTime > 0 || paidChatTime > 0) {

                if (currentChatTime == 0) {
                    setTimeout(() => {
                        chatTimeUpdate();
                    }, 60000);
                }

                if (!inputMessage.trim().length) {
                    return;
                }
                const data = inputMessage;

                setMessages((old) => [...old, { role: "user", content: data }]);
                setInputMessage("");

                let params = { message: messages, version: version };
                try {
                    // let inititalPrediction = { status: 'processing' };
                    // setPrediction(inititalPrediction);
                    const response = await axios.post("/api/openAI_Chat", params);
                    setMessages((old) => [...old, { role: "assistant", content: response.data.message }]);
                } catch (error) {
                    console.log(error);
                    setMessages((old) => [...old, { role: "assistant", content: "..." }]);
                    //@ts-ignore*
                    toast.error(error.response.data.message)
                }
            } else {
                toast.error("Please buy Chat Time with MyAi token.")
            }

        } else {
            toast.error("Please connect wallet to chat with AI.")
        }
    };

    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        //@ts-ignore*
        useEffect(() => elementRef.current.scrollIntoView());
        //@ts-ignore*
        return <div ref={elementRef} />;
    };

    useEffect(() => {
        if (publicKey) {
            checkUser();
        }
    }, [publicKey]);

    const checkUser = async () => {
        let params = { wallet_address: publicKey?.toString() };
        const response = await axios.post("/api/account_info/get", params);
        if (!(response.data.free_image_amount >= 0)) {
            await axios.post("/api/account_info/signup", params);
        }
    }

    return (
        <>
            <Flex
                direction={'column'}
                alignItems={'center'}
                padding={['5px', '10px', '10px', '10px', '15px']}
                width={['95%', '90%', '85%', '80%', '80%', '75%']}
                margin={'auto'}
                marginTop={'10px'}
            >
                <Flex w="100%" direction="column" p="3" paddingBottom={'100px'}>
                    {messages.map((item, index) => {
                        if (item.role === "user") {
                            return (
                                <Flex
                                    w="100%"
                                    justify="flex-end"
                                    key={index}
                                >
                                    <Flex
                                        bg="#BEE3F8"
                                        color="black"
                                        minW="100px"
                                        maxW="350px"
                                        my="1"
                                        p="3"
                                        borderRadius={'10px'}
                                    >
                                        <Text>{item.content}</Text>
                                    </Flex>
                                </Flex>
                            );
                        } else {
                            return (
                                <Flex w="100%"
                                    key={index}
                                >
                                    {/* <Avatar
                                        name="AI"
                                        src="https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
                                        bg="blue.300"
                                    ></Avatar> */}
                                    <Flex
                                        bg="gray.100"
                                        // bg={'#C6F6D5'}
                                        color="black"
                                        minW="100px"
                                        // maxW="350px"
                                        maxW={['350px', '350px', '500px', '500px', '500px', '500px']}
                                        my="1"
                                        p="3"
                                        borderRadius={'10px'}
                                    >
                                        <Text>{item.content}</Text>
                                    </Flex>
                                </Flex>
                            );
                        }
                    })}
                    <AlwaysScrollToBottom />
                </Flex>

                <Flex
                    direction={'row'}
                    alignItems={'center'}
                    width={['95%', '90%', '85%', '80%', '80%', '75%']}
                    backgroundColor={'white'}
                    padding={'10px'}
                    position={'fixed'}
                    bottom={'0px'}
                >
                    <Flex
                        position={'relative'}
                        width={'100%'}
                    >

                        <Input
                            type="text"
                            name="name"
                            placeholder="Ask something..."
                            color={'#262A37'}
                            padding={'15px'}
                            paddingRight={'110px'}
                            margin={'10px'}
                            height={'60px'}
                            width={'100%'}
                            value={inputMessage}
                            border={'1px solid #ED2775 !important'}
                            borderRadius={'5px'}
                            boxShadow={'unset !important'}
                            onChange={e => { setInputMessage(e.currentTarget.value); }}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                            required
                        />
                        <Button
                            position={'absolute'}
                            right={'20px'}
                            bottom={'20px'}
                            width={'90px'}
                            zIndex={'100'}
                            onClick={handleSendMessage}
                            disabled={inputMessage.trim().length <= 0}
                            background={'#E53E3E'}
                            color={'white'}
                            _hover={{
                                background: '#ED2775'
                            }}
                            _active={{
                                background: '#ED2775'
                            }}
                        >
                            Send
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}

export default Chat;