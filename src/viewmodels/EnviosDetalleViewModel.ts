import { useState } from 'react';
import { EnviosDetalleService } from '../services/EnviosDetalleService';

export const useEnviosDetalleViewModel = (id?: number) => {
  const [envio, setEnvio] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const service = new EnviosDetalleService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchEnvio(id);
    setEnvio(data);
    setLoading(false);
  };
  return { envio, loading, load };
};
