import { useState } from 'react';
import { MinijuegoService } from '../services/MinijuegoService';

export const useMinijuegoViewModel = () => {
  const [cargado, setCargado] = useState(false);
  const service = new MinijuegoService();
  const init = async () => {
    await service.init();
    setCargado(true);
  };
  return { cargado, init };
};
