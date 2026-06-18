export interface Reserva {
  id: string;
  deporte: string;
  pista: string;
  fecha: string;
  hora: string;
  precio: string;
  instalacionId?: string | number | null;
}

export interface DatosReserva {
  deporte: string;
  pista: string;
  fecha: string;
  hora: string;
  precio: string;
  instalacionId?: string | number;
}
