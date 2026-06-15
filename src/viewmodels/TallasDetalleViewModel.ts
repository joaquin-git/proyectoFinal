import { useState } from 'react';
import { TallasDetalleService } from '../services/TallasDetalleService';

export const useTallasDetalleViewModel = () => {
  const [tallas, setTallas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const service = new TallasDetalleService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchTallas();
    setTallas(data);
    setLoading(false);
  };
  return { tallas, loading, load };
};
