use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};
use spl_associated_token_account;

declare_id!("62hQ5gqobREUgYGD6hktcjV6zVraYysAp6NUqghn5H2a");

#[program]
pub mod myaipayment {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let payment = &mut ctx.accounts.payment;
        let admin = &mut ctx.accounts.admin;
        payment.admin = admin.key();
        payment.paused = false;
        Ok(())
    }

    pub fn set_admin(ctx: Context<SetAdmin>, new_admin: Pubkey) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;

        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.admin = new_admin;

        Ok(())
    }

    pub fn set_token_address(ctx: Context<SetTokenAddress>, token: Pubkey) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;

        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.token = token;

        Ok(())
    }

    pub fn set_treasury_wallet(
        ctx: Context<SetTreasuryWallet>,
        treasury_wallet: Pubkey,
    ) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;

        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.treasury_wallet = spl_associated_token_account::get_associated_token_address(
            &treasury_wallet,
            &payment.token,
        );

        Ok(())
    }

    pub fn set_dev_wallets(ctx: Context<SetDevWallets>, dev_wallets: [Pubkey; 2]) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;

        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.dev_wallets[0] = spl_associated_token_account::get_associated_token_address(
            &dev_wallets[0],
            &payment.token,
        );
        payment.dev_wallets[1] = spl_associated_token_account::get_associated_token_address(
            &dev_wallets[1],
            &payment.token,
        );

        Ok(())
    }

    pub fn set_dev_fees(ctx: Context<SetDevFees>, dev_fees: [u16; 2]) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;

        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.dev_fees = dev_fees;

        Ok(())
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        let payment = &mut ctx.accounts.payment;
        require!(admin.key() == payment.admin, ErrorCode::Unauthorized);
        payment.paused = paused;

        Ok(())
    }

    pub fn send_token(ctx: Context<SendToken>, amount: u64) -> Result<()> {
        let payment = &mut ctx.accounts.payment;

        require!(!payment.paused, ErrorCode::PaymentPaused);

        let treasury_wallet_token_account = &mut ctx.accounts.treasury_wallet_token_account;
        let dev_wallet_1_token_account = &mut ctx.accounts.dev_wallet_1_token_account;
        let dev_wallet_2_token_account = &mut ctx.accounts.dev_wallet_2_token_account;
        require!(
            treasury_wallet_token_account.key() == payment.treasury_wallet,
            ErrorCode::InvalidTreasuryTokenAccount
        );
        require!(
            dev_wallet_1_token_account.key() == payment.dev_wallets[0],
            ErrorCode::InvalidDevTokenAccount
        );
        require!(
            dev_wallet_2_token_account.key() == payment.dev_wallets[1],
            ErrorCode::InvalidDevTokenAccount
        );

        let payer_token_account = &mut ctx.accounts.payer_token_account;

        let total_percent = 100 as u64;
        let dev_fee_1 = (amount * payment.dev_fees[0] as u64) / total_percent;
        let dev_fee_2 = (amount * payment.dev_fees[1] as u64) / total_percent;
        let treasury_amount = amount - dev_fee_1 - dev_fee_2;

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_accounts_t = Transfer {
            from: payer_token_account.to_account_info(),
            to: treasury_wallet_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_ctx_t = CpiContext::new(cpi_program.clone(), cpi_accounts_t);
        token::transfer(cpi_ctx_t, treasury_amount)?;

        let cpi_accounts_d1 = Transfer {
            from: payer_token_account.to_account_info(),
            to: dev_wallet_1_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_ctx_d1 = CpiContext::new(cpi_program.clone(), cpi_accounts_d1);
        token::transfer(cpi_ctx_d1, dev_fee_1)?;

        let cpi_accounts_d2 = Transfer {
            from: payer_token_account.to_account_info(),
            to: dev_wallet_2_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_ctx_d2 = CpiContext::new(cpi_program, cpi_accounts_d2);
        token::transfer(cpi_ctx_d2, dev_fee_2)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 173)]
    pub payment: Account<'info, MyAiPayment>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetAdmin<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetTokenAddress<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetTreasuryWallet<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetDevWallets<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetDevFees<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SendToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub payment: Account<'info, MyAiPayment>,
    #[account(mut)]
    /// CHECK: Should be treated as token account
    pub payer_token_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Should be treated as token account
    pub treasury_wallet_token_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Should be treated as token account
    pub dev_wallet_1_token_account: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Should be treated as token account
    pub dev_wallet_2_token_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MyAiPayment {
    pub admin: Pubkey,
    pub token: Pubkey,
    pub paused: bool,
    pub treasury_wallet: Pubkey,
    pub dev_wallets: [Pubkey; 2],
    pub dev_fees: [u16; 2],
}

#[error_code]
pub enum ErrorCode {
    #[msg("The requested operation is not authorized.")]
    Unauthorized,

    #[msg("Invalid treasury token account.")]
    InvalidTreasuryTokenAccount,

    #[msg("Invalid dev token account.")]
    InvalidDevTokenAccount,

    #[msg("Payment is paused by admin.")]
    PaymentPaused,
}
