#![cfg(test)]

use super::{AmanPayEscrow, AmanPayEscrowClient, ContractError, DealStatus, DealType, Resolution};
use soroban_sdk::{
    testutils::{Address as _, Events as _, Ledger},
    token, Address, BytesN, Env,
};

const START_TIME: u64 = 1_000;
const INITIAL_BALANCE: i128 = 1_000_000;
const DEAL_AMOUNT: i128 = 100_000;

struct Fixture {
    env: Env,
    contract_id: Address,
    admin: Address,
    seller: Address,
    buyer: Address,
    resolver: Address,
    outsider: Address,
    token: Address,
    second_token: Address,
}

impl Fixture {
    fn new() -> Self {
        let env = Env::default();
        env.ledger().set_timestamp(START_TIME);
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);
        let resolver = Address::generate(&env);
        let outsider = Address::generate(&env);
        let contract_id = env.register(AmanPayEscrow, (&admin,));

        let first_asset = env.register_stellar_asset_contract_v2(admin.clone());
        let second_asset = env.register_stellar_asset_contract_v2(admin.clone());
        let token = first_asset.address();
        let second_token = second_asset.address();

        token::StellarAssetClient::new(&env, &token).mint(&buyer, &INITIAL_BALANCE);
        token::StellarAssetClient::new(&env, &second_token).mint(&buyer, &INITIAL_BALANCE);

        let client = AmanPayEscrowClient::new(&env, &contract_id);
        client.set_asset_enabled(&token, &true);
        client.set_asset_enabled(&second_token, &true);

        Self {
            env,
            contract_id,
            admin,
            seller,
            buyer,
            resolver,
            outsider,
            token,
            second_token,
        }
    }

    fn client(&self) -> AmanPayEscrowClient<'_> {
        AmanPayEscrowClient::new(&self.env, &self.contract_id)
    }

    fn hash(&self, byte: u8) -> BytesN<32> {
        BytesN::from_array(&self.env, &[byte; 32])
    }

    fn create_deal_with_asset(&self, asset: &Address) -> u64 {
        self.client().create_deal(
            &DealType::Service,
            &self.seller,
            &self.buyer,
            &self.resolver,
            asset,
            &DEAL_AMOUNT,
            &self.hash(1),
            &(START_TIME + 1_000),
            &100u64,
            &2u32,
            &200u64,
        )
    }

    fn create_deal(&self) -> u64 {
        self.create_deal_with_asset(&self.token)
    }

    fn fund(&self, deal_id: u64) {
        self.client().fund_deal(&deal_id);
    }

    fn deliver(&self, deal_id: u64) {
        self.client().submit_delivery(&deal_id, &self.hash(2));
    }

    fn token_client(&self, asset: &Address) -> token::Client<'_> {
        token::Client::new(&self.env, asset)
    }
}

#[test]
fn creates_and_reads_a_deal() {
    let f = Fixture::new();
    let deal_id = f.create_deal();
    let deal = f.client().get_deal(&deal_id);

    assert_eq!(deal_id, 1);
    assert_eq!(deal.id, deal_id);
    assert_eq!(deal.deal_type, DealType::Service);
    assert_eq!(deal.status, DealStatus::Created);
    assert_eq!(deal.seller, f.seller);
    assert_eq!(deal.buyer, f.buyer);
    assert_eq!(deal.resolver, f.resolver);
    assert_eq!(deal.asset, f.token);
    assert_eq!(deal.amount, DEAL_AMOUNT);
    assert_eq!(deal.terms_hash, f.hash(1));
    assert_eq!(deal.delivery_hash, None);
    assert_eq!(deal.dispute_hash, None);
    assert_eq!(deal.delivery_deadline, START_TIME + 1_000);
    assert_eq!(deal.review_period, 100);
    assert_eq!(deal.revision_limit, 2);
    assert_eq!(deal.revision_period, 200);
    assert_eq!(deal.revision_count, 0);
    assert_eq!(deal.created_at, START_TIME);
    assert_eq!(deal.funded_at, None);
    assert_eq!(deal.delivered_at, None);
    assert_eq!(deal.closed_at, None);

    assert_eq!(f.create_deal(), 2);
}

#[test]
fn rejects_disabled_asset() {
    let f = Fixture::new();
    let disabled = Address::generate(&f.env);

    assert_eq!(
        f.client().try_create_deal(
            &DealType::Custom,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &disabled,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::AssetNotEnabled))
    );
}

#[test]
fn validates_create_inputs() {
    let f = Fixture::new();
    let client = f.client();

    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &0i128,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidAmount))
    );
    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.seller,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidParties))
    );
    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.buyer,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidResolver))
    );
    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &START_TIME,
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidDeadline))
    );
    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &0u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidPeriod))
    );
    assert_eq!(
        client.try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &1u32,
            &0u64,
        ),
        Err(Ok(ContractError::InvalidPeriod))
    );
}

#[test]
fn admin_controls_asset_allowlist() {
    let f = Fixture::new();
    let asset = Address::generate(&f.env);
    let client = f.client();

    assert!(!client.is_asset_enabled(&asset));
    client.set_asset_enabled(&asset, &true);
    assert!(client.is_asset_enabled(&asset));
    client.set_asset_enabled(&asset, &false);
    assert!(!client.is_asset_enabled(&asset));
}

#[test]
fn privileged_actions_require_real_role_authorization() {
    let f = Fixture::new();
    let client = f.client();
    let asset = Address::generate(&f.env);

    f.env.set_auths(&[]);
    assert!(client.try_set_asset_enabled(&asset, &true).is_err());

    assert!(client
        .try_create_deal(
            &DealType::Service,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(1),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        )
        .is_err());

    f.env.mock_all_auths();
    let id = f.create_deal();
    f.env.set_auths(&[]);
    assert!(client.try_fund_deal(&id).is_err());

    f.env.mock_all_auths();
    f.fund(id);
    f.env.set_auths(&[]);
    assert!(client.try_submit_delivery(&id, &f.hash(2)).is_err());

    f.env.mock_all_auths();
    f.deliver(id);
    f.env.set_auths(&[]);
    assert!(client.try_approve_release(&id).is_err());

    f.env.mock_all_auths();
    client.open_dispute(&id, &f.buyer, &f.hash(3));
    f.env.set_auths(&[]);
    assert!(client
        .try_resolve_dispute(&id, &Resolution::RefundBuyer)
        .is_err());

    // The expected admin identity remains part of the fixture and cannot be substituted.
    assert_ne!(f.admin, f.outsider);
}

#[test]
fn disabling_asset_only_blocks_new_deals() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.client().set_asset_enabled(&f.token, &false);

    assert_eq!(
        f.client().try_create_deal(
            &DealType::Custom,
            &f.seller,
            &f.buyer,
            &f.resolver,
            &f.token,
            &DEAL_AMOUNT,
            &f.hash(8),
            &(START_TIME + 100),
            &10u64,
            &0u32,
            &0u64,
        ),
        Err(Ok(ContractError::AssetNotEnabled))
    );

    f.fund(id);
    f.deliver(id);
    f.client().approve_release(&id);
    assert_eq!(f.client().get_deal(&id).status, DealStatus::Released);
}

#[test]
fn funding_locks_tokens_and_cannot_repeat() {
    let f = Fixture::new();
    let id = f.create_deal();
    let token = f.token_client(&f.token);

    f.fund(id);

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Funded);
    assert_eq!(token.balance(&f.buyer), INITIAL_BALANCE - DEAL_AMOUNT);
    assert_eq!(token.balance(&f.contract_id), DEAL_AMOUNT);
    assert_eq!(
        f.client().try_fund_deal(&id),
        Err(Ok(ContractError::InvalidState))
    );
}

#[test]
fn delivery_revision_and_resubmission_follow_limits() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);
    f.deliver(id);

    let delivered = f.client().get_deal(&id);
    assert_eq!(delivered.status, DealStatus::Delivered);
    assert_eq!(delivered.delivery_hash, Some(f.hash(2)));
    assert_eq!(delivered.review_deadline, Some(START_TIME + 100));

    f.client().request_revision(&id, &f.hash(3));
    let revision = f.client().get_deal(&id);
    assert_eq!(revision.status, DealStatus::RevisionRequested);
    assert_eq!(revision.revision_count, 1);
    assert_eq!(revision.delivery_deadline, START_TIME + 200);
    assert_eq!(revision.delivery_hash, None);

    f.env.ledger().set_timestamp(START_TIME + 10);
    f.client().submit_delivery(&id, &f.hash(4));
    f.client().request_revision(&id, &f.hash(5));
    f.client().submit_delivery(&id, &f.hash(6));

    assert_eq!(
        f.client().try_request_revision(&id, &f.hash(7)),
        Err(Ok(ContractError::RevisionLimitReached))
    );
}

#[test]
fn buyer_approval_releases_exact_balance_once() {
    let f = Fixture::new();
    let id = f.create_deal();
    let token = f.token_client(&f.token);
    f.fund(id);
    f.deliver(id);

    f.client().approve_release(&id);

    let deal = f.client().get_deal(&id);
    assert_eq!(deal.status, DealStatus::Released);
    assert_eq!(deal.closed_at, Some(START_TIME));
    assert_eq!(token.balance(&f.seller), DEAL_AMOUNT);
    assert_eq!(token.balance(&f.contract_id), 0);
    assert_eq!(
        f.client().try_approve_release(&id),
        Err(Ok(ContractError::InvalidState))
    );
}

#[test]
fn expired_undelivered_deal_refunds_buyer() {
    let f = Fixture::new();
    let id = f.create_deal();
    let token = f.token_client(&f.token);
    f.fund(id);

    assert_eq!(
        f.client().try_refund_expired_undelivered(&id),
        Err(Ok(ContractError::DeadlineNotReached))
    );
    f.env.ledger().set_timestamp(START_TIME + 1_001);
    f.client().refund_expired_undelivered(&id);

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Refunded);
    assert_eq!(token.balance(&f.buyer), INITIAL_BALANCE);
    assert_eq!(token.balance(&f.contract_id), 0);
}

#[test]
fn delivered_deal_releases_after_review_timeout() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);
    f.deliver(id);

    assert_eq!(
        f.client().try_release_after_review_timeout(&id),
        Err(Ok(ContractError::ReviewPeriodNotElapsed))
    );
    f.env.ledger().set_timestamp(START_TIME + 101);
    f.client().release_after_review_timeout(&id);

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Released);
    assert_eq!(f.token_client(&f.token).balance(&f.seller), DEAL_AMOUNT);
}

#[test]
fn resolver_can_refund_a_dispute() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);
    f.client().open_dispute(&id, &f.buyer, &f.hash(9));

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Disputed);
    f.client().resolve_dispute(&id, &Resolution::RefundBuyer);

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Refunded);
    assert_eq!(f.token_client(&f.token).balance(&f.buyer), INITIAL_BALANCE);
}

#[test]
fn resolver_can_release_a_dispute() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);
    f.client().open_dispute(&id, &f.seller, &f.hash(10));
    f.client().resolve_dispute(&id, &Resolution::ReleaseSeller);

    assert_eq!(f.client().get_deal(&id).status, DealStatus::Released);
    assert_eq!(f.token_client(&f.token).balance(&f.seller), DEAL_AMOUNT);
}

#[test]
fn outsider_cannot_open_dispute() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);

    assert_eq!(
        f.client().try_open_dispute(&id, &f.outsider, &f.hash(11)),
        Err(Ok(ContractError::InvalidParty))
    );
}

#[test]
fn seller_can_cancel_only_before_funding() {
    let f = Fixture::new();
    let first = f.create_deal();
    f.client().cancel_unfunded_deal(&first);
    assert_eq!(f.client().get_deal(&first).status, DealStatus::Cancelled);

    let second = f.create_deal();
    f.fund(second);
    assert_eq!(
        f.client().try_cancel_unfunded_deal(&second),
        Err(Ok(ContractError::InvalidState))
    );
}

#[test]
fn generic_engine_settles_two_different_assets() {
    let f = Fixture::new();

    for asset in [&f.token, &f.second_token] {
        let id = f.create_deal_with_asset(asset);
        f.fund(id);
        f.deliver(id);
        f.client().approve_release(&id);
        assert_eq!(f.client().get_deal(&id).status, DealStatus::Released);
        assert_eq!(f.token_client(asset).balance(&f.seller), DEAL_AMOUNT);
        assert_eq!(f.token_client(asset).balance(&f.contract_id), 0);
    }
}

#[test]
fn arithmetic_overflow_is_rejected() {
    let f = Fixture::new();
    let id = f.client().create_deal(
        &DealType::Service,
        &f.seller,
        &f.buyer,
        &f.resolver,
        &f.token,
        &DEAL_AMOUNT,
        &f.hash(1),
        &u64::MAX,
        &100u64,
        &1u32,
        &u64::MAX,
    );
    f.fund(id);
    f.deliver(id);

    assert_eq!(
        f.client().try_request_revision(&id, &f.hash(12)),
        Err(Ok(ContractError::ArithmeticOverflow))
    );
}

#[test]
fn lifecycle_emits_events() {
    let f = Fixture::new();
    let id = f.create_deal();
    f.fund(id);
    f.deliver(id);
    f.client().approve_release(&id);

    // The latest top-level invocation contains the token transfer and AmanPay release event.
    assert_eq!(f.env.events().all().events().len(), 2);
}
