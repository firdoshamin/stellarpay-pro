import { describe, it, expect } from 'vitest';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { isValidStellarAddress, isValidContractId, getExplorerUrl } from './stellar';

describe('stellar utility', () => {
  describe('isValidStellarAddress', () => {
    it('returns false for invalid addresses', () => {
      expect(isValidStellarAddress('')).toBe(false);
      expect(isValidStellarAddress('invalid-key')).toBe(false);
      expect(isValidStellarAddress('C12345')).toBe(false);
    });

    it('returns true for valid Stellar Ed25519 public key', () => {
      const validKey = Keypair.random().publicKey();
      expect(isValidStellarAddress(validKey)).toBe(true);
    });
  });

  describe('isValidContractId', () => {
    it('returns false for invalid contract IDs', () => {
      expect(isValidContractId('')).toBe(false);
      expect(isValidContractId('GBBD47IF6LWK2P7MDEVSCWR7DPUWV3NY3DTQEVFL4TWVCGXGK3OO2CVB')).toBe(false);
    });

    it('returns true for valid Soroban contract C... address', () => {
      const contractBytes = Buffer.alloc(32, 1);
      const validContract = StrKey.encodeContract(contractBytes);
      expect(isValidContractId(validContract)).toBe(true);
    });
  });

  describe('getExplorerUrl', () => {
    it('constructs correct explorer URLs', () => {
      const url = getExplorerUrl('GBBD47', 'account', 'testnet');
      expect(url).toBe('https://stellar.expert/explorer/testnet/account/GBBD47');
    });

    it('constructs futurenet transaction URLs', () => {
      const url = getExplorerUrl('txhash123', 'tx', 'futurenet');
      expect(url).toBe('https://stellar.expert/explorer/futurenet/tx/txhash123');
    });
  });
});
