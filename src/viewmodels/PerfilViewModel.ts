import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useReservas } from '../contexto/ReservasContext';
import { Reserva } from '../tipos/Reserva';

const MESES: Record<string, number> = {
  'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
  'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
};

export const esReservaPasada = (fechaStr: string, horaStr: string): boolean => {
  try {
    const partes = fechaStr.split(' ');
    const diaNum = parseInt(partes[1]);
    const mesNombre = partes.length > 3 ? partes[3] : partes[2];
    const mesNum = MESES[mesNombre];
    if (isNaN(diaNum) || mesNum === undefined) return false;

    const ahora = new Date();
    const fechaReserva = new Date(ahora.getFullYear(), mesNum, diaNum);
    if (mesNum < ahora.getMonth() && ahora.getMonth() === 11) {
      fechaReserva.setFullYear(ahora.getFullYear() + 1);
    }
    const [horas, minutos] = horaStr.split(':').map(Number);
    fechaReserva.setHours(horas, minutos, 0, 0);
    return ahora > fechaReserva;
  } catch (e) {
    return false;
  }
};

export const usePerfilViewModel = (navigation: { navigate?: (...args: unknown[]) => void }) => {
  const { misReservas, eliminarReserva } = useReservas();

  const reservasActivas = useMemo(
    () => misReservas.filter(res => !esReservaPasada(res.fecha, res.hora)),
    [misReservas]
  );

  const reservasPasadas = useMemo(
    () => misReservas.filter(res => esReservaPasada(res.fecha, res.hora)),
    [misReservas]
  );

  const confirmarCancelacion = (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.',
      [
        { text: 'No, mantener' },
        { text: 'Sí, cancelar', onPress: () => eliminarReserva(id), style: 'destructive' },
      ]
    );
  };

  const gestionarReserva = (reserva: Reserva) => {
    Alert.alert(
      'Gestionar Reserva',
      `¿Qué deseas hacer con tu reserva en ${reserva.pista}?`,
      [
        {
          text: 'Modificar',
          onPress: () => navigation.navigate?.('ReservaDetalle', {
            deporte: reserva.deporte,
            pista: reserva.pista,
            esEdicion: true,
            idReserva: reserva.id,
          }),
        },
        { text: 'Cancelar Reserva', onPress: () => confirmarCancelacion(reserva.id), style: 'destructive' },
        { text: 'Cerrar', style: 'cancel' },
      ]
    );
  };

  return { reservasActivas, reservasPasadas, gestionarReserva, esReservaPasada };
};
