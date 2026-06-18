import { useState } from 'react';
import { ReservaPistasService } from '../services/ReservaPistasService';
import { Reserva, DatosReserva } from '../tipos/Reserva';

export const useReservaPistasViewModel = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const service = new ReservaPistasService();

  const load = async () => {
    setLoading(true);
    const data = await service.fetchReservas();
    setReservas(data);
    setLoading(false);
  };

  const crear = async (datos: DatosReserva) => {
    setLoading(true);
    const res = await service.crearReserva(datos);
    await load();
    setLoading(false);
    return res;
  };

  const obtenerOcupadas = async (instalacionId: string | number, fecha: string, deporte: string) => {
    return await service.obtenerOcupadas(instalacionId, fecha, deporte);
  };

  const modificar = async (id: string | number, nuevaData: Partial<DatosReserva>) => {
    const res = await service.modificarReserva(id, nuevaData);
    await load();
    return res;
  };

  const cancelar = async (reservaId: string | number) => {
    const res = await service.cancelarReserva(reservaId);
    await load();
    return res;
  };

  return { reservas, loading, load, crear, obtenerOcupadas, modificar, cancelar };
};
