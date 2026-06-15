import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMisReservas, crearReserva, getReservasOcupadas, modificarReserva, cancelarReserva } from '../../servicios/api';

export class ReservaPistasService {
  async fetchReservas(): Promise<any[]> {
    try {
      const raw = await AsyncStorage.getItem('usuarioRegistrado');
      if (!raw) return [];
      const u = JSON.parse(raw);
      const id = u?.id;
      if (!id) return [];
      const data = await getMisReservas(id);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async crearReserva(datos: any) {
    return await crearReserva(datos);
  }

  async obtenerOcupadas(instalacionId: string | number, fecha: string, deporte: string) {
    return await getReservasOcupadas(instalacionId, fecha, deporte);
  }

  async modificarReserva(id: string | number, nuevaData: any) {
    return await modificarReserva(id, nuevaData);
  }

  async cancelarReserva(reservaId: string | number) {
    return await cancelarReserva(reservaId);
  }
}
