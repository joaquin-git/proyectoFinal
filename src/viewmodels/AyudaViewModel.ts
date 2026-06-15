import { useState } from 'react';
import { AyudaService } from '../services/AyudaService';

export const useAyudaViewModel = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const service = new AyudaService();
  const load = async () => {
    setLoading(true);
    const data = await service.fetchFaq();
    setFaqs(data);
    setLoading(false);
  };
  return { faqs, loading, load };
};
