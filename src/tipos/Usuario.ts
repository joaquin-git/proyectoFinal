export interface Usuario {
  id?: string | number;
  usuario?: string;
  email?: string;
  foto?: string;
  rol?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre?: string;
  usuario: string;
  email: string;
  rol: string;
  foto?: string;
}
