#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PaymentRecord {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub memo: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Payment(u64),
    PaymentCount,
}

#[contract]
pub struct PaymentTrackerContract;

#[contractimpl]
impl PaymentTrackerContract {
    /// Records a new payment transaction and emits a Soroban event.
    /// Requires authentication from the sender (`from.require_auth()`).
    pub fn record_payment(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
        memo: String,
    ) -> u64 {
        // Security check: require authorization from sender
        from.require_auth();

        // Validation: amount must be strictly positive
        if amount <= 0 {
            panic!("Payment amount must be greater than zero");
        }

        // Get current total payment count
        let count_key = DataKey::PaymentCount;
        let mut count: u64 = env.storage().instance().get(&count_key).unwrap_or(0);
        count += 1;

        let timestamp = env.ledger().timestamp();

        let record = PaymentRecord {
            id: count,
            sender: from.clone(),
            recipient: to.clone(),
            amount,
            memo: memo.clone(),
            timestamp,
        };

        // Persistent storage for recorded payment record
        env.storage().persistent().set(&DataKey::Payment(count), &record);
        // Instance storage for running counter
        env.storage().instance().set(&count_key, &count);

        // Emit Soroban contract event for real-time frontend listener synchronization
        // Topics: (symbol_short!("record"), sender, recipient)
        // Data: (payment_id, amount, memo)
        env.events().publish(
            (symbol_short!("record"), from, to),
            (count, amount, memo),
        );

        count
    }

    /// Retrieves a payment record by its unique payment ID.
    pub fn get_payment(env: Env, payment_id: u64) -> Option<PaymentRecord> {
        env.storage().persistent().get(&DataKey::Payment(payment_id))
    }

    /// Returns total number of recorded payment transactions.
    pub fn get_payment_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0)
    }
}

mod test;
