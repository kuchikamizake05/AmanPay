use crate::{error::ContractError, types::Deal};
use soroban_sdk::{contracttype, Address, Env};

const INSTANCE_TTL_THRESHOLD: u32 = 17_280;
const INSTANCE_TTL_EXTEND_TO: u32 = 518_400;
const DEAL_TTL_THRESHOLD: u32 = 17_280;
const DEAL_TTL_EXTEND_TO: u32 = 518_400;

#[contracttype]
#[derive(Clone)]
pub(crate) enum DataKey {
    Admin,
    NextDealId,
    AssetEnabled(Address),
    Deal(u64),
}

pub(crate) fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}

pub(crate) fn read_deal(env: &Env, id: u64) -> Result<Deal, ContractError> {
    let key = DataKey::Deal(id);
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

pub(crate) fn write_deal(env: &Env, deal: &Deal) {
    let key = DataKey::Deal(deal.id);
    env.storage().persistent().set(&key, deal);
    env.storage()
        .persistent()
        .extend_ttl(&key, DEAL_TTL_THRESHOLD, DEAL_TTL_EXTEND_TO);
}

pub(crate) fn next_deal_id(env: &Env) -> Result<u64, ContractError> {
    let id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextDealId)
        .unwrap_or(1);
    let next = id.checked_add(1).ok_or(ContractError::ArithmeticOverflow)?;
    env.storage().instance().set(&DataKey::NextDealId, &next);
    Ok(id)
}
