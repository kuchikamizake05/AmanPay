#![no_std]

use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct NotesContract;

#[contractimpl]
impl NotesContract {}

mod test;
