#![no_std]

mod error;
mod events;
mod storage;
mod types;

pub use error::ContractError;
pub use types::{Deal, DealStatus, DealType, Resolution};

use events::*;
use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, MuxedAddress};
use storage::{extend_instance_ttl, next_deal_id, read_deal, write_deal, DataKey};

#[contract]
pub struct AmanPayEscrow;

fn token_transfer(env: &Env, asset: &Address, from: &Address, to: &Address, amount: i128) {
    token::Client::new(env, asset).transfer(from, MuxedAddress::from(to), &amount);
}

fn release_to_seller(env: &Env, deal: &mut Deal) {
    let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0);
    let fee_recipient: Option<Address> = env.storage().instance().get(&DataKey::FeeRecipient);

    let fee_amount = if fee_bps > 0 && fee_recipient.is_some() {
        (deal.amount * (fee_bps as i128)) / 10_000
    } else {
        0
    };

    let seller_amount = deal.amount - fee_amount;

    if fee_amount > 0 {
        if let Some(ref recipient) = fee_recipient {
            token_transfer(
                env,
                &deal.asset,
                &env.current_contract_address(),
                recipient,
                fee_amount,
            );
        }
    }

    token_transfer(
        env,
        &deal.asset,
        &env.current_contract_address(),
        &deal.seller,
        seller_amount,
    );
    deal.status = DealStatus::Released;
    deal.closed_at = Some(env.ledger().timestamp());
    write_deal(env, deal);
}

fn refund_to_buyer(env: &Env, deal: &mut Deal) {
    token_transfer(
        env,
        &deal.asset,
        &env.current_contract_address(),
        &deal.buyer,
        deal.amount,
    );
    deal.status = DealStatus::Refunded;
    deal.closed_at = Some(env.ledger().timestamp());
    write_deal(env, deal);
}

#[contractimpl]
impl AmanPayEscrow {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextDealId, &1u64);
        extend_instance_ttl(&env);
    }

    pub fn set_asset_enabled(env: Env, asset: Address, enabled: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let key = DataKey::AssetEnabled(asset.clone());
        if enabled {
            env.storage().instance().set(&key, &true);
        } else {
            env.storage().instance().remove(&key);
        }
        extend_instance_ttl(&env);
        AssetUpdated { asset, enabled }.publish(&env);
    }

    pub fn is_asset_enabled(env: Env, asset: Address) -> bool {
        extend_instance_ttl(&env);
        env.storage()
            .instance()
            .get(&DataKey::AssetEnabled(asset))
            .unwrap_or(false)
    }

    pub fn set_fee_config(env: Env, fee_bps: u32, recipient: Address) -> Result<(), ContractError> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if fee_bps > 1_000 {
            return Err(ContractError::ArithmeticOverflow);
        }

        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::FeeRecipient, &recipient);
        extend_instance_ttl(&env);
        Ok(())
    }

    pub fn get_fee_bps(env: Env) -> u32 {
        extend_instance_ttl(&env);
        env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_deal(
        env: Env,
        deal_type: DealType,
        seller: Address,
        buyer: Address,
        resolver: Address,
        asset: Address,
        amount: i128,
        terms_hash: BytesN<32>,
        delivery_deadline: u64,
        review_period: u64,
        revision_limit: u32,
        revision_period: u64,
    ) -> Result<u64, ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if seller == buyer {
            return Err(ContractError::InvalidParties);
        }
        if resolver == seller || resolver == buyer {
            return Err(ContractError::InvalidResolver);
        }
        let now = env.ledger().timestamp();
        if delivery_deadline <= now {
            return Err(ContractError::InvalidDeadline);
        }
        if review_period == 0 || (revision_limit > 0 && revision_period == 0) {
            return Err(ContractError::InvalidPeriod);
        }
        let enabled: bool = env
            .storage()
            .instance()
            .get(&DataKey::AssetEnabled(asset.clone()))
            .unwrap_or(false);
        if !enabled {
            return Err(ContractError::AssetNotEnabled);
        }

        seller.require_auth();
        let id = next_deal_id(&env)?;
        let deal = Deal {
            id,
            deal_type,
            seller: seller.clone(),
            buyer: buyer.clone(),
            resolver,
            asset: asset.clone(),
            amount,
            terms_hash,
            delivery_hash: None,
            dispute_hash: None,
            delivery_deadline,
            review_period,
            review_deadline: None,
            revision_limit,
            revision_period,
            revision_count: 0,
            status: DealStatus::Created,
            cancel_requested_by: None,
            created_at: now,
            funded_at: None,
            delivered_at: None,
            closed_at: None,
        };
        write_deal(&env, &deal);
        extend_instance_ttl(&env);
        DealCreated {
            deal_id: id,
            seller,
            buyer,
            asset,
            amount,
        }
        .publish(&env);
        Ok(id)
    }

    pub fn fund_deal(env: Env, id: u64) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Created {
            return Err(ContractError::InvalidState);
        }
        if env.ledger().timestamp() > deal.delivery_deadline {
            return Err(ContractError::DeadlinePassed);
        }
        deal.buyer.require_auth();
        token_transfer(
            &env,
            &deal.asset,
            &deal.buyer,
            &env.current_contract_address(),
            deal.amount,
        );
        deal.status = DealStatus::Funded;
        deal.funded_at = Some(env.ledger().timestamp());
        write_deal(&env, &deal);
        DealFunded {
            deal_id: id,
            amount: deal.amount,
        }
        .publish(&env);
        Ok(())
    }

    pub fn submit_delivery(
        env: Env,
        id: u64,
        delivery_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Funded && deal.status != DealStatus::RevisionRequested {
            return Err(ContractError::InvalidState);
        }
        let now = env.ledger().timestamp();
        if now > deal.delivery_deadline {
            return Err(ContractError::DeadlinePassed);
        }
        let review_deadline = now
            .checked_add(deal.review_period)
            .ok_or(ContractError::ArithmeticOverflow)?;
        deal.seller.require_auth();
        deal.delivery_hash = Some(delivery_hash.clone());
        deal.delivered_at = Some(now);
        deal.review_deadline = Some(review_deadline);
        deal.status = DealStatus::Delivered;
        write_deal(&env, &deal);
        DeliverySubmitted {
            deal_id: id,
            delivery_hash,
        }
        .publish(&env);
        Ok(())
    }

    pub fn request_revision(
        env: Env,
        id: u64,
        reason_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Delivered {
            return Err(ContractError::InvalidState);
        }
        let now = env.ledger().timestamp();
        if now > deal.review_deadline.ok_or(ContractError::InvalidState)? {
            return Err(ContractError::ReviewPeriodElapsed);
        }
        if deal.revision_count >= deal.revision_limit {
            return Err(ContractError::RevisionLimitReached);
        }
        let next_deadline = now
            .checked_add(deal.revision_period)
            .ok_or(ContractError::ArithmeticOverflow)?;
        deal.buyer.require_auth();
        deal.revision_count = deal
            .revision_count
            .checked_add(1)
            .ok_or(ContractError::ArithmeticOverflow)?;
        deal.delivery_deadline = next_deadline;
        deal.delivery_hash = None;
        deal.delivered_at = None;
        deal.review_deadline = None;
        deal.status = DealStatus::RevisionRequested;
        write_deal(&env, &deal);
        RevisionRequested {
            deal_id: id,
            revision_count: deal.revision_count,
            reason_hash,
        }
        .publish(&env);
        Ok(())
    }

    pub fn approve_release(env: Env, id: u64) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Delivered {
            return Err(ContractError::InvalidState);
        }
        deal.buyer.require_auth();
        release_to_seller(&env, &mut deal);
        DealReleased {
            deal_id: id,
            amount: deal.amount,
        }
        .publish(&env);
        Ok(())
    }

    pub fn open_dispute(
        env: Env,
        id: u64,
        opener: Address,
        reason_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Funded
            && deal.status != DealStatus::Delivered
            && deal.status != DealStatus::RevisionRequested
        {
            return Err(ContractError::InvalidState);
        }
        if opener != deal.buyer && opener != deal.seller {
            return Err(ContractError::InvalidParty);
        }
        opener.require_auth();
        deal.status = DealStatus::Disputed;
        deal.dispute_hash = Some(reason_hash.clone());
        write_deal(&env, &deal);
        DisputeOpened {
            deal_id: id,
            opener,
            reason_hash,
        }
        .publish(&env);
        Ok(())
    }

    pub fn refund_expired_undelivered(env: Env, id: u64) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Funded && deal.status != DealStatus::RevisionRequested {
            return Err(ContractError::InvalidState);
        }
        if env.ledger().timestamp() <= deal.delivery_deadline {
            return Err(ContractError::DeadlineNotReached);
        }
        refund_to_buyer(&env, &mut deal);
        DealRefunded {
            deal_id: id,
            amount: deal.amount,
        }
        .publish(&env);
        Ok(())
    }

    pub fn release_after_review_timeout(env: Env, id: u64) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Delivered {
            return Err(ContractError::InvalidState);
        }
        let deadline = deal.review_deadline.ok_or(ContractError::InvalidState)?;
        if env.ledger().timestamp() <= deadline {
            return Err(ContractError::ReviewPeriodNotElapsed);
        }
        release_to_seller(&env, &mut deal);
        DealReleased {
            deal_id: id,
            amount: deal.amount,
        }
        .publish(&env);
        Ok(())
    }

    pub fn resolve_dispute(env: Env, id: u64, resolution: Resolution) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Disputed {
            return Err(ContractError::InvalidState);
        }
        deal.resolver.require_auth();
        match resolution {
            Resolution::RefundBuyer => refund_to_buyer(&env, &mut deal),
            Resolution::ReleaseSeller => release_to_seller(&env, &mut deal),
        }
        DisputeResolved {
            deal_id: id,
            resolution,
        }
        .publish(&env);
        Ok(())
    }

    pub fn request_or_confirm_mutual_cancel(
        env: Env,
        id: u64,
        caller: Address,
    ) -> Result<bool, ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Funded
            && deal.status != DealStatus::Delivered
            && deal.status != DealStatus::RevisionRequested
        {
            return Err(ContractError::InvalidState);
        }
        if caller != deal.buyer && caller != deal.seller {
            return Err(ContractError::InvalidParty);
        }
        caller.require_auth();

        if let Some(ref requester) = deal.cancel_requested_by {
            if requester == &caller {
                return Ok(false);
            }
            refund_to_buyer(&env, &mut deal);
            MutualCancelCompleted {
                deal_id: id,
                amount: deal.amount,
            }
            .publish(&env);
            Ok(true)
        } else {
            deal.cancel_requested_by = Some(caller.clone());
            write_deal(&env, &deal);
            MutualCancelRequested {
                deal_id: id,
                requested_by: caller,
            }
            .publish(&env);
            Ok(false)
        }
    }

    pub fn cancel_unfunded_deal(env: Env, id: u64) -> Result<(), ContractError> {
        let mut deal = read_deal(&env, id)?;
        if deal.status != DealStatus::Created {
            return Err(ContractError::InvalidState);
        }
        deal.seller.require_auth();
        deal.status = DealStatus::Cancelled;
        deal.closed_at = Some(env.ledger().timestamp());
        write_deal(&env, &deal);
        DealCancelled {
            deal_id: id,
            seller: deal.seller.clone(),
        }
        .publish(&env);
        Ok(())
    }

    pub fn get_deal(env: Env, id: u64) -> Result<Deal, ContractError> {
        read_deal(&env, id)
    }
}

#[cfg(test)]
mod test;
