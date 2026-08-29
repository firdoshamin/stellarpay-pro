export interface HorizonRawBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  code?: string;
  issuer?: string;
  balance: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface AssetBalance {
  code: string;
  issuer?: string;
  balance: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
  asset_type: string;
}

export interface AccountDetails {
  id: string;
  sequence: string;
  balances: HorizonRawBalance[];
  subentry_count: number;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
}

export interface StellarTransactionRecord {
  id: string;
  hash: string;
  created_at: string;
  source_account: string;
  successful: boolean;
  fee_charged: string;
  memo?: string;
  memo_type?: string;
  operation_count: number;
}
