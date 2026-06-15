import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MisComprasService } from '../services/MisComprasService';

export const useMisComprasViewModel = () => {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const service = new MisComprasService();

  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          const data = await service.fetchCompras();
          setCompras(data);
        } catch (e) {
          console.error(e);
        }
      };
      cargar();
    }, [])
  );

  const procesarDevolucion = async (compra: any): Promise<void> => {
    const nuevas = await service.procesarDevolucion(compra, compras);
    setCompras(nuevas);
    Alert.alert(
      'Solicitud enviada',
      'Pasarán a recoger el producto en 24-48 horas y se le devolverá el dinero en un plazo de 5 días.'
    );
  };

  return { compras, loading, procesarDevolucion };
};
