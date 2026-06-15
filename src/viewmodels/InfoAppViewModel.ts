import { useState } from 'react';
import { InfoAppService } from '../services/InfoAppService';

export const useInfoAppViewModel = () => {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const service = new InfoAppService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchInfo();
    setInfo(data);
    setLoading(false);
  };
  return { info, loading, load };
};
