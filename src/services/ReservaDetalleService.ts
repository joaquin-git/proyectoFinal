import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMisReservas } from '../../servicios/api';

export class ReservaDetalleService {
  async fetchReserva(id?: number): Promise<any> {
    try {
      if (!id) return null;
      const raw = await AsyncStorage.getItem('usuarioRegistrado');
      if (!raw) return null;
      const u = JSON.parse(raw);
      const usuarioId = u?.id;
      if (!usuarioId) return null;
      const data = await getMisReservas(usuarioId);
      if (!Array.isArray(data)) return null;
      const found = data.find((r: any) => String(r.id) === String(id) || String(r.reserva_id) === String(id));
      return found || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
