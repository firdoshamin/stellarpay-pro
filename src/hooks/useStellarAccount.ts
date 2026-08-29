import { useState, useEffect } from 'react';
import { AccountDetails } from '../types/stellar';
import { horizonService } from '../services/stellar/horizonService';
import { useWalletStore } from '../store/useWalletStore';

export function useStellarAccount() {
  const { publicKey } = useWalletStore();
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setAccount(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    horizonService
      .fetchAccount(publicKey)
      .then((data) => {
        if (isMounted) {
          setAccount(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching account');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  return { account, loading, error };
}
