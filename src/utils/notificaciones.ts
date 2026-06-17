import * as Notifications from 'expo-notifications';

const MESES: Record<string, number> = {
  Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
  Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
};

export async function programarRecordatorioReserva(
  deporte: string,
  pista: string,
  fecha: string,
  hora: string,
): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Fecha formato: "Martes, 18 Junio" → extraer día y mes
  const match = fecha.match(/(\d+)\s+(\w+)/);
  if (!match) return;

  const dia = parseInt(match[1], 10);
  const mes = MESES[match[2]];
  if (mes === undefined) return;

  const [horas, minutos] = hora.split(':').map(Number);
  const ahora = new Date();
  const fechaReserva = new Date(ahora.getFullYear(), mes, dia, horas, minutos, 0);

  // Si la fecha ya pasó este año, asumir el año siguiente
  if (fechaReserva < ahora) {
    fechaReserva.setFullYear(ahora.getFullYear() + 1);
  }

  const fechaNotificacion = new Date(fechaReserva.getTime() - 60 * 60 * 1000);
  if (fechaNotificacion <= ahora) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${deporte} — en 1 hora`,
      body: `Tu reserva en ${pista} empieza a las ${hora}. ¡Prepárate!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fechaNotificacion,
    },
  });
}
