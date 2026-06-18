export interface DatosInstalacion {
  id?: string | number;
  nombre?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
}

export interface Instalacion {
  id: string | number;
  nombre: string;
  latitud: number;
  longitud: number;
  direccion: string;
  deportes: string | string[];
  horario: string;
  puntuacion: string;
  web: string;
  imagen: string;
}
