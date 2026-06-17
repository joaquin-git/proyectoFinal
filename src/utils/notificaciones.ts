import * as Notifications from 'expo-notifications';

const MESES: Record<string, number> = {
  Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
  Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
};

// Devuelve el texto del recordatorio si se programó, null si no fue posible.
export async function programarRecordatorioReserva(
  deporte: string,
  pista: string,
  fecha: string,
  hora: string,
): Promise<string | null> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[Notificaciones] Permiso:', status);
    if (status !== 'granted') return null;

    // Fecha formato: "Martes, 18 Junio" → extraer día y mes
    const match = fecha.match(/(\d+)\s+(\w+)/);
    if (!match) {
      console.log('[Notificaciones] No se pudo parsear la fecha:', fecha);
      return null;
    }

    const dia = parseInt(match[1], 10);
    const mes = MESES[match[2]];
    if (mes === undefined) {
      console.log('[Notificaciones] Mes no reconocido:', match[2]);
      return null;
    }

    const [horas, minutos] = hora.split(':').map(Number);
    const ahora = new Date();
    const fechaReserva = new Date(ahora.getFullYear(), mes, dia, horas, minutos, 0);

    if (fechaReserva < ahora) {
      fechaReserva.setFullYear(ahora.getFullYear() + 1);
    }

    const minutosRestantes = (fechaReserva.getTime() - ahora.getTime()) / 60000;
    console.log('[Notificaciones] Minutos hasta la reserva:', minutosRestantes);

    let anticipoMs: number;
    let textoAnticipo: string;

    if (minutosRestantes > 70) {
      anticipoMs = 60 * 60 * 1000;
      textoAnticipo = '1 hora antes';
    } else if (minutosRestantes > 20) {
      anticipoMs = 10 * 60 * 1000;
      textoAnticipo = '10 minutos antes';
    } else {
      console.log('[Notificaciones] Reserva demasiado próxima, se omite.');
      return null;
    }

    const fechaNotificacion = new Date(fechaReserva.getTime() - anticipoMs);
    console.log('[Notificaciones] Notificación para:', fechaNotificacion.toISOString());

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${deporte} — ${textoAnticipo}`,
        body: `Tu reserva en ${pista} empieza a las ${hora}. ¡Prepárate!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fechaNotificacion,
      },
    });

    return textoAnticipo;
  } catch (e) {
    console.error('[Notificaciones] Error:', e);
    return null;
  }
}
