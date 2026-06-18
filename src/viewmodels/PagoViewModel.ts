import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { PagoService } from '../services/PagoService';
import { useReservas } from '../contexto/ReservasContext';
import { ItemCarrito } from '../tipos/Producto';
import { Reserva } from '../tipos/Reserva';

export const usePagoViewModel = () => {
  const [loading, setLoading] = useState(false);
  const { agregarReserva } = useReservas();
  const service = new PagoService();

  const validar = (metodo: string, tarjeta: string, caducidad: string, cvv: string, telefonoBizum: string): string | null => {
    if (metodo === 'tarjeta' && (tarjeta.length < 16 || !caducidad || !cvv))
      return 'Por favor, completa los datos de la tarjeta.';
    if (metodo === 'bizum' && telefonoBizum.length < 9)
      return 'Introduce un número de Bizum válido.';
    return null;
  };

  const pagarCarrito = async (
    productos: ItemCarrito[],
    total: number,
    metodo: string,
    onSuccess: () => void
  ): Promise<void> => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('usuarioRegistrado');
      const user = userStr ? JSON.parse(userStr) : null;
      await service.procesarCompra({ userId: user?.id, productos, total, metodo });
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1500);
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo procesar el pago.');
    }
  };

  const pagarReserva = async (
    reservaData: Reserva,
    onSuccess: () => void
  ): Promise<void> => {
    setLoading(true);
    try {
      await agregarReserva({ ...reservaData });
      setLoading(false);
      onSuccess();
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo procesar el pago.');
    }
  };

  return { loading, validar, pagarCarrito, pagarReserva };
};
