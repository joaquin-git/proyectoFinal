import AsyncStorage from '@react-native-async-storage/async-storage';
import { devolverCompra as devolverCompraApi } from '../../servicios/api';

export class MisComprasService {
  async fetchCompras(): Promise<any[]> {
    const datos = await AsyncStorage.getItem('historial_compras');
    return datos ? JSON.parse(datos) : [];
  }

  async procesarDevolucion(compra: any, todasLasCompras: any[]): Promise<any[]> {
    if (compra.dbIds && compra.dbIds.length > 0) {
      for (const id of compra.dbIds) {
        try { await devolverCompraApi(id); } catch (e) {}
      }
    }
    const nuevas = todasLasCompras.map((c: any) =>
      c.id === compra.id ? { ...c, estado: 'Devuelto' as const } : c
    );
    await AsyncStorage.setItem('historial_compras', JSON.stringify(nuevas));
    return nuevas;
  }
}
