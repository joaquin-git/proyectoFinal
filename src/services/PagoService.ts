import AsyncStorage from '@react-native-async-storage/async-storage';
import { realizarCompra } from '../../servicios/api';

export class PagoService {
  async procesarCompra(datos: { userId: any; productos: any[]; total: number; metodo: string }): Promise<void> {
    const dbIds: number[] = [];
    const fechaAhora = new Date().toISOString();

    for (const prod of datos.productos) {
      try {
        const res = await realizarCompra({
          usuario_id: datos.userId,
          producto_id: prod.id || 1,
          cantidad: prod.cantidad || 1,
          fecha: fechaAhora,
          total: prod.precio,
        });
        if (res?.id) dbIds.push(res.id);
      } catch (e) {}
    }

    const historialPrevio = await AsyncStorage.getItem('historial_compras');
    const historial = historialPrevio ? JSON.parse(historialPrevio) : [];

    const nuevaCompra = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      total: datos.total,
      estado: 'Entregado',
      productos: datos.productos,
      imagen: datos.productos[0]?.imagen || '',
      metodoPago: datos.metodo,
      dbIds,
    };

    await AsyncStorage.setItem('historial_compras', JSON.stringify([nuevaCompra, ...historial]));
  }

  async processPago(data: any): Promise<any> {
    return null;
  }
}
