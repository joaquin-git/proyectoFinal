import { useState, useMemo } from 'react';
import { ReservaDetalleService } from '../services/ReservaDetalleService';
import { ReservaPistasService } from '../services/ReservaPistasService';

export const PRECIOS: Record<string, string> = {
  'Pádel': '20,00 €',
  'Fútbol Sala': '50,00 €',
  'Tenis': '10,00 €',
  'Fútbol 7': '70,00 €'
};

export const HORAS_DISPONIBLES = [
  '09:00', '10:30', '12:00', '13:30',
  '16:00', '17:30', '19:00', '20:30', '22:00'
];

export const esHoraPasadaFn = (horaSlot: string, esHoy: boolean): boolean => {
  if (!esHoy) return false;
  const ahora = new Date();
  const [horas, minutos] = horaSlot.split(':').map(Number);
  const fechaSlot = new Date();
  fechaSlot.setHours(horas, minutos, 0, 0);
  return ahora > fechaSlot;
};

export const esOcupadaFn = (
  hora: string,
  ocupadas: any[],
  pista: string,
  centro: string | undefined,
  deporte: string
): boolean => {
  if (!ocupadas || ocupadas.length === 0) return false;
  const pistaFormateada = centro ? `${pista} - ${centro}` : pista;
  const limpiar = (t: string) =>
    String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  return ocupadas.some(
    o =>
      limpiar(o.hora) === limpiar(hora) &&
      limpiar(o.pista) === limpiar(pistaFormateada) &&
      limpiar(o.deporte) === limpiar(deporte)
  );
};

const generarDias = () => {
  const lista = [];
  for (let i = 0; i < 14; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);

    const nombreDiaCorto =
      fecha.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').charAt(0).toUpperCase() +
      fecha.toLocaleDateString('es-ES', { weekday: 'short' }).slice(1, 3);

    const nombreDiaCompleto = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaLargo = nombreDiaCompleto.charAt(0).toUpperCase() + nombreDiaCompleto.slice(1);
    const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });

    lista.push({
      dia: nombreDiaCorto,
      diaCompleto: diaLargo,
      num: fecha.getDate().toString(),
      mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
      esHoy: i === 0
    });
  }
  return lista;
};

export const useReservaDetalleViewModel = (id?: number) => {
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ocupadas, setOcupadas] = useState<any[]>([]);
  const service = new ReservaDetalleService();
  const pistasService = new ReservaPistasService();

  const dias = useMemo(() => generarDias(), []);

  const load = async () => {
    setLoading(true);
    const data = await service.fetchReserva(id);
    setReserva(data);
    setLoading(false);
  };

  const cargarOcupadas = async (
    instalacionId: string | number,
    diaIdx: number,
    deporte: string
  ) => {
    if (!instalacionId) return;
    const d = dias[diaIdx];
    const fechaStr = `${d.diaCompleto}, ${d.num} ${d.mes}`;
    try {
      const data = await pistasService.obtenerOcupadas(instalacionId, fechaStr, deporte);
      setOcupadas(data || []);
    } catch (e) {
      console.error('Error al cargar disponibilidad:', e);
    }
  };

  const modificar = async (nuevaData: any) => {
    if (!reserva?.id) return null;
    setLoading(true);
    const res = await pistasService.modificarReserva(reserva.id, nuevaData);
    await load();
    setLoading(false);
    return res;
  };

  const cancelar = async () => {
    if (!reserva?.id) return null;
    setLoading(true);
    const res = await pistasService.cancelarReserva(reserva.id);
    await load();
    setLoading(false);
    return res;
  };

  return { reserva, loading, dias, ocupadas, cargarOcupadas, load, modificar, cancelar };
};
