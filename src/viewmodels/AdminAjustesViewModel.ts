import { useState } from 'react';
import { AdminAjustesService } from '../services/AdminAjustesService';

export const useAdminAjustesViewModel = () => {
  const [loading, setLoading] = useState(false);
  const service = new AdminAjustesService();
  const save = async (data: any) => {
    setLoading(true);
    await service.saveAjustes(data);
    setLoading(false);
  };
  return { loading, save };
};
