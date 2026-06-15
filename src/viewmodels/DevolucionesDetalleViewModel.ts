import { useState } from 'react';
import { DevolucionesDetalleService } from '../services/DevolucionesDetalleService';

export const useDevolucionesDetalleViewModel = (id?: number) => {
  const [devolucion, setDevolucion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const service = new DevolucionesDetalleService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchDevolucion(id);
    setDevolucion(data);
    setLoading(false);
  };
  return { devolucion, loading, load };
};
