import { useState } from 'react';
import { SeleccionPistaService } from '../services/SeleccionPistaService';

export const useSeleccionPistaViewModel = () => {
  const [pistas, setPistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const service = new SeleccionPistaService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchPistas();
    setPistas(data);
    setLoading(false);
  };
  return { pistas, loading, load };
};
