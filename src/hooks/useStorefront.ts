import { useEffect, useState } from 'react';
import { Product } from '../types';
import { storageService } from '../utils/storage';

export function useStorefront() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ products: Product[]; status: 'loading' | 'ready' | 'error' }>({
    products: [],
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();
    storageService.getPublicProducts(controller.signal).then(
      (products) => {
        if (!controller.signal.aborted) setState({ products, status: 'ready' });
      },
      () => {
        if (!controller.signal.aborted) setState({ products: [], status: 'error' });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  return {
    ...state,
    retry() {
      setState({ products: [], status: 'loading' });
      setAttempt((current) => current + 1);
    },
  };
}
