use soroban_sdk::contracterror;

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
