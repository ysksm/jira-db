import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../domain/entities/Product';
import { useContainer } from '../../di/ContainerContext';

export function useProducts() {
  const { productRepository } = useContainer();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await productRepository.findAll();
    setProducts(data);
    setLoading(false);
  }, [productRepository]);

  useEffect(() => { load(); }, [load]);

  const searchProducts = async (query: string) => {
    setLoading(true);
    const data = query ? await productRepository.search(query) : await productRepository.findAll();
    setProducts(data);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    await productRepository.delete(id);
    await load();
  };

  return { products, loading, searchProducts, deleteProduct, reload: load };
}
