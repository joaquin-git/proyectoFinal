import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMenuViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const datos = await AsyncStorage.getItem('usuarioRegistrado');
      if (datos) setUsuario(JSON.parse(datos));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { loading, usuario, load };
};
