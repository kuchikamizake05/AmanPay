#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, BytesN,
    Env, MuxedAddress,
};

const INSTANCE_TTL_THRESHOLD: u32 = 17_280;
const INSTANCE_TTL_EXTEND_TO: u32 = 518_400;
const DEAL_TTL_THRESHOLD: u32 = 17_280;
const DEAL_TTL_EXTEND_TO: u32 = 518_400;

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DealType {
    Service,
    DigitalGoods,
    Custom,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DealStatus {
    Created,
    Funded,
    Delivered,
    RevisionRequested,
    Disputed,
    Released,
    Refunded,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Resolution {
    RefundBuyer,
    ReleaseSeller,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Deal {
    pub id: u64,
    pub deal_type: DealType,
    pub seller: Address,
    pub buyer: Address,
    pub resolver: Address,
    pub asset: Address,
    pub amount: i128,
    pub terms_hash: BytesN<32>,
    pub delivery_hash: Option<BytesN<32>>,
    pub dispute_hash: Option<BytesN<32>>,
    pub delivery_deadline: u64,
    pub review_period: u64,
    pub review_deadline: Option<u64>,
    pub revision_limit: u32,
    pub revision_period: u64,
    pub revision_count: u32,
    pub status: DealStatus,
    pub created_at: u64,
    pub funded_at: Option<u64>,
    pub delivered_at: Option<u64>,
    pub closed_at: Option<u64>,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    NextDealId,
    AssetEnabled(Address),
    Deal(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    AssetNotEnabled = 1,
    InvalidAmount = 2,
    InvalidDeadline = 3,
    InvalidPeriod = 4,
    InvalidParties = 5,
    InvalidResolver = 6,
    DealNotFound = 7,
    InvalidState = 8,
    DeadlineNotReached = 9,
    ReviewPeriodNotElapsed = 10,
    RevisionLimitReached = 11,
    InvalidParty = 12,
    ArithmeticOverflow = 13,
    DeadlinePassed = 14,
    ReviewPeriodElapsed = 15,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AssetUpdated {
    #[topic]
    pub asset: Address,
    pub enabled: bool,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DealCreated {
    #[topic]
    pub deal_id: u64,
    pub seller: Address,
    pub buyer: Address,
    pub asset: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DealFunded {
    #[topic]
    pub deal_id: u64,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeliverySubmitted {
    #[topic]
    pub deal_id: u64,
    pub delivery_hash: BytesN<32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RevisionRequested {
    #[topic]
    pub deal_id: u64,
    pub revision_count: u32,
    pub reason_hash: BytesN<32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeOpened {
    #[topic]
    pub deal_id: u64,
    pub opener: Address,
    pub reason_hash: BytesN<32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DealReleased {
    #[topic]
    pub deal_id: u64,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DealRefunded {
    #[topic]
    pub deal_id: u64,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeResolved {
    #[topic]
    pub deal_id: u64,
    pub resolution: Resolution,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DealCancelled {
    #[topic]
    pub deal_id: u64,
    pub seller: Address,
}

#[contract]
pub struct AmanPayEscrow;

fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}

fn deal_key(id: u64) -> DataKey {
    DataKey::Deal(id)
}

fn read_deal(env: &Env, id: u64) -> Result<Deal, ContractError> {
    let key = deal_key(id);
    let deal = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(ContractError::DealNotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, DEAL_TTL_THRESHOLD, DEAL_TTL_EXTEND_TO);
    Ok(deal)
}

fn write_deal(env: &Env, deal: &Deal) {
    let key = deal_key(deal.id);
    env.storage().persistent().set(&key, deal);
    env.storage()
        .persistent()
        .extend_ttl(&key, DEAL_TTL_THRESHOLD, DEAL_TTL_EXTEND_TO);
}

fn next_deal_id(env: &Env) -> Result<u64, ContractError> {
    let id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextDealId)
        .unwrap_or(1);
    let next = id.checked_add(1).ok_or(ContractError::ArithmeticOverflow)?;
    env.storage().instance().set(&DataKey::NextDealId, &next);
    Ok(id)
}

fn token_transfer(env: &Env, asset: &Address, from: &Address, to: &Address, amount: i128) {
    token::Client::new(env, asset).transfer(from, &MuxedAddress::from(to), &amount);
}

fn release_to_seller(env: &Env, deal: &mut Deal) {
    token_transfer(
        env,
        &deal.asset,
        &env.current_contract_address(),
        &deal.seller,
        deal.amount,
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

mod test;
