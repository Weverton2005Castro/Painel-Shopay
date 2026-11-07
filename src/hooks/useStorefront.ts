import { useEffect, useState } from 'react';
import { Product } from '../types';
import { useStore } from './useStore';
import { storeProducts } from '../utils/storage';

export function useStorefront() {
  const { id } = useStore();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ products: Product[]; status: 'loading' | 'ready' | 'error' }>({
    products: [],
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();
    storeProducts(id).getPublicProducts(controller.signal).then(
      (products) => {
        if (!controller.signal.aborted) setState({ products, status: 'ready' });
      },
      () => {
        if (!controller.signal.aborted) setState({ products: [], status: 'error' });
      },
    );
    return () => controller.abort();
  }, [attempt, id]);

  return {
    ...state,
    retry() {
      setState({ products: [], status: 'loading' });
      setAttempt((current) => current + 1);
    },
  };
}
