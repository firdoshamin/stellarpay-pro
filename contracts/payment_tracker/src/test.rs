#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_record_and_get_payment() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentTrackerContract);
    let client = PaymentTrackerContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "Invoice #1001");

    env.mock_all_auths();

    // Record payment #1
    let payment_id = client.record_payment(&sender, &recipient, &500_0000000, &memo);
    assert_eq!(payment_id, 1);
    assert_eq!(client.get_payment_count(), 1);

    // Retrieve payment #1
    let record = client.get_payment(&payment_id).expect("Payment record should exist");
    assert_eq!(record.id, 1);
    assert_eq!(record.sender, sender);
    assert_eq!(record.recipient, recipient);
    assert_eq!(record.amount, 500_0000000);
    assert_eq!(record.memo, memo);
}

#[test]
#[should_panic(expected = "Payment amount must be greater than zero")]
fn test_record_zero_amount_panics() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentTrackerContract);
    let client = PaymentTrackerContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "Invalid Zero Payment");

    env.mock_all_auths();
    client.record_payment(&sender, &recipient, &0, &memo);
}
