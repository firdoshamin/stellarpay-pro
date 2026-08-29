import { StrKey } from '@stellar/stellar-sdk';

/**
 * Validates a Stellar Public Key (G...).
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address) return false;
  return StrKey.isValidEd25519PublicKey(address);
}

/**
 * Validates a Stellar Contract ID (C...).
 */
export function isValidContractId(contractId: string): boolean {
  if (!contractId) return false;
  return StrKey.isValidContract(contractId);
}

/**
 * Returns StellarExpert explorer URL for account, tx, or contract.
 */
export function getExplorerUrl(
  identifier: string,
  type: 'account' | 'tx' | 'contract' = 'account',
  network: 'testnet' | 'futurenet' | 'public' = 'testnet'
): string {
  const baseUrl = `https://stellar.expert/explorer/${network}`;
  return `${baseUrl}/${type}/${identifier}`;
}
