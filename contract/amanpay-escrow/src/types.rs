use soroban_sdk::{contracttype, Address, BytesN};

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
