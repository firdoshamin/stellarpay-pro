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
    assert_eq!(record.status, 1); // Default Completed
}

#[test]
fn test_update_payment_status() {
    let env = Env::default();
    let tracker_id = env.register_contract(None, PaymentTrackerContract);
    let client = PaymentTrackerContractClient::new(&env, &tracker_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "Invoice #1002");

    env.mock_all_auths();

    let payment_id = client.record_payment(&sender, &recipient, &100_0000000, &memo);
    assert_eq!(payment_id, 1);

    // Update status to Refunded (2)
    let updated = client.update_payment_status(&payment_id, &2);
    assert!(updated);

    let record = client.get_payment(&payment_id).unwrap();
    assert_eq!(record.status, 2);
}

#[test]
fn test_inter_contract_communication() {
    let env = Env::default();
    let tracker_id = env.register_contract(None, PaymentTrackerContract);
    let verifier_id = env.register_contract(None, PaymentVerifierContract);

    let verifier_client = PaymentVerifierContractClient::new(&env, &verifier_id);
    let tracker_client = PaymentTrackerContractClient::new(&env, &tracker_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "Inter-contract payment");

    env.mock_all_auths();

    // Call record_via_verifier which invokes PaymentTrackerContract.record_payment cross-contract
    let payment_id = verifier_client.record_via_verifier(
        &tracker_id,
        &sender,
        &recipient,
        &250_0000000,
        &memo,
    );

    assert_eq!(payment_id, 1);
    assert_eq!(tracker_client.get_payment_count(), 1);

    let record = tracker_client.get_payment(&payment_id).unwrap();
    assert_eq!(record.amount, 250_0000000);
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
