#![cfg(test)]

use super::NotesContract;
use soroban_sdk::Env;

#[test]
fn contract_can_be_registered() {
    let env = Env::default();
    env.register(NotesContract, ());
}
