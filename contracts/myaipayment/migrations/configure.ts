// import * as anchor from "@project-serum/anchor";
import * as anchor from "@coral-xyz/anchor";
import { createAssociatedTokenAccount } from "@solana/spl-token";
import { Myaipayment } from "../target/types/myaipayment";

// Set the below to approriate values
const TREASURY_ADDRESS = "8Q9M9PNQP33EfHcyqueBub23z4bsAQjZn4UJ8vbeXCaj";
const DEV_01_WALLET_ADDRESS = "4LiaNzv7uK7mQqquBN9z7qkQ3LgH8vYg8nCapUAWuZ5A";
const DEV_02_WALLET_ADDRESS = "9chrXAxNB99xa5R9AkoTT6Ft17G98c9Vt8BFtBH3heJU";
const TOKEN_MINT_ADDRESS = "ExwSdKk455aTyJ6poApJ4gVCrS57vyexGDDc6qeGGPob";
const DEV_01_FEE = 20;
const DEV_02_FEE = 10;

// Program specific configuration
// const PROGRAM_ID = "62hQ5gqobREUgYGD6hktcjV6zVraYysAp6NUqghn5H2a";

// Comment the below to run the same on playground
const pg: any = null;
const isPlayGround: Boolean = pg != null ? true : false;

const connection = getConnection();
const program = getProgram(isPlayGround);
const adminKeypair = getAdminKeypair(isPlayGround);
const adminPublicKey = adminKeypair.publicKey;

const paymentAccount = anchor.web3.Keypair.generate();
console.log(Object.values(paymentAccount.secretKey));
// const paymentAccount = anchor.web3.Keypair.fromSecretKey(
//     Uint8Array.from(key)
// );

const tokenAddress = new anchor.web3.PublicKey(TOKEN_MINT_ADDRESS);
const treasuryWallet = new anchor.web3.PublicKey(TREASURY_ADDRESS);
const devWallet01 = new anchor.web3.PublicKey(DEV_01_WALLET_ADDRESS);
const devWallet02 = new anchor.web3.PublicKey(DEV_02_WALLET_ADDRESS);

// console.log("Contract Address        : " + PROGRAM_ID);
console.log("Admin Wallet Address    : " + adminPublicKey.toString());
console.log("Payment Account Address : " + paymentAccount.publicKey.toString());
console.log("Token Mint Address      : " + tokenAddress);
console.log("Treasury Wallet Address : " + treasuryWallet.toString());
console.log("Dev 01 Wallet Address   : " + devWallet01.toString());
console.log("Dev 02 Wallet Address   : " + devWallet02.toString());
console.log("Dev 01 Fee              : " + DEV_01_FEE);
console.log("Dev 02 Fee              : " + DEV_02_FEE);

initialize_payment();
set_token_address();
set_dev_wallets();
set_treasury_wallet();
set_dev_fees(DEV_01_FEE, DEV_02_FEE);
// set_pause(true);
// set_pause(false);

// await initialize_payment();
// await set_token_address();
// await set_dev_wallets();
// await set_treasury_wallet();
// await set_dev_fees(DEV_01_FEE, DEV_02_FEE);
// await set_pause(true);
// await set_pause(false);

async function initialize_payment() {
    await program.rpc.initialize({
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [paymentAccount],
    });
}

async function set_token_address() {
    await program.rpc.setTokenAddress(tokenAddress, {
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
        },
    });
}

async function set_treasury_wallet() {
    await program.rpc.setTreasuryWallet(treasuryWallet, {
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
        },
    });
}

async function set_dev_wallets() {
    await program.rpc.setDevWallets([devWallet01, devWallet02], {
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
        },
    });
}

async function set_dev_fees(dev_01_fee: number, dev_02_fee: number) {
    await program.rpc.setDevFees([dev_01_fee, dev_02_fee], {
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
        },
    });
}

async function set_pause(pause: boolean) {
    await program.rpc.setPause(pause, {
        accounts: {
            payment: paymentAccount.publicKey,
            admin: adminPublicKey,
        },
    });
}

async function getTokenAccount(addr: anchor.web3.PublicKey) {
    const TOKEN_MINT = new anchor.web3.PublicKey(TOKEN_MINT_ADDRESS);
    const tokenList = await connection.getTokenAccountsByOwner(
        new anchor.web3.PublicKey(addr),
        { mint: TOKEN_MINT }
    );

    let paymentTokenAccount = null;
    if (tokenList.value.length > 0) {
        const usdcTokenAccount = tokenList.value[0];
        paymentTokenAccount = usdcTokenAccount.pubkey;
    } else {
        // Create associated token accounts for the new accounts
        paymentTokenAccount = await createAssociatedTokenAccount(
            program.provider.connection,
            adminKeypair,
            TOKEN_MINT,
            addr
        );
    }
    return paymentTokenAccount;
}

function getConnection() {
    const connection = new anchor.web3.Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
    return connection;
}

function getProgram(playGround: Boolean = false) {
    if (!playGround) {
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);
        const program = anchor.workspace.Myaipayment as anchor.Program<Myaipayment>;
        return program;
    } else {
        return pg.program;
    }
}

function getAdminKeypair(playGround: Boolean = false) {
    if (!playGround) {
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);
        return provider.wallet;
    } else {
        return pg.wallet.keypair;
    }
}
