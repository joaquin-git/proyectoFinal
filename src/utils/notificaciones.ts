import * as Notifications from 'expo-notifications';

const MESES: Record<string, number> = {
  Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
  Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
};

// Devuelve true si el recordatorio se programó, false si no fue posible.
export async function programarRecordatorioReserva(
  deporte: string,
  pista: string,
  fecha: string,
  hora: string,
): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[Notificaciones] Permiso:', status);
    if (status !== 'granted') return false;

    // Fecha formato: "Martes, 18 Junio" → extraer día y mes
    const match = fecha.match(/(\d+)\s+(\w+)/);
    if (!match) {
      console.log('[Notificaciones] No se pudo parsear la fecha:', fecha);
      return false;
    }

    const dia = parseInt(match[1], 10);
    const mes = MESES[match[2]];
    if (mes === undefined) {
      console.log('[Notificaciones] Mes no reconocido:', match[2]);
      return false;
    }

    const [horas, minutos] = hora.split(':').map(Number);
    const ahora = new Date();
    const fechaReserva = new Date(ahora.getFullYear(), mes, dia, horas, minutos, 0);

    if (fechaReserva < ahora) {
      fechaReserva.setFullYear(ahora.getFullYear() + 1);
    }

    const fechaNotificacion = new Date(fechaReserva.getTime() - 60 * 60 * 1000);
    console.log('[Notificaciones] Reserva:', fechaReserva.toISOString());
    console.log('[Notificaciones] Notificación programada para:', fechaNotificacion.toISOString());

    if (fechaNotificacion <= ahora) {
      console.log('[Notificaciones] La notificación sería en el pasado, se omite.');
      return false;
    }

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

    return true;
  } catch (e) {
    console.error('[Notificaciones] Error al programar:', e);
    return false;
  }
}
