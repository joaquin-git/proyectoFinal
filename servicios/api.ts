import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverConfig } from '../src/config/serverConfig';

let BASE_URL: string = '';

export const initializeAPI = async () => {
  BASE_URL = await serverConfig.getBaseUrl();
};

const getBaseUrl = async () => {
  if (!BASE_URL) {
    BASE_URL = await serverConfig.getBaseUrl();
  }
  return BASE_URL;
};

// ── AUTH HELPERS ──────────────────────────────────────────────────────────────

const getAuthToken = async (): Promise<string | null> =>
  AsyncStorage.getItem('authToken');

const intentarRefresh = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    const url = await getBaseUrl();
    const res = await fetch(`${url}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'usuarioRegistrado']);
      return null;
    }
    const data = await res.json();
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    if (data.usuario) await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(data.usuario));
    return data.token;
  } catch {
    return null;
  }
};

// Fetch autenticado: añade el header Authorization y reintenta una vez si el token expiró
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const nuevoToken = await intentarRefresh();
    if (nuevoToken) {
      headers['Authorization'] = `Bearer ${nuevoToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
};

// ── USUARIO ───────────────────────────────────────────────────────────────────

export const registrarUsuario = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const loginUsuario = async (identificador: string, contrasena: string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identificador, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const actualizarUsuario = async (id: string | number, datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// ── INSTALACIONES ─────────────────────────────────────────────────────────────

export const getInstalaciones = async () => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/instalaciones`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// ── RESERVAS ──────────────────────────────────────────────────────────────────

export const crearReserva = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/reservas`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const getReservasOcupadas = async (instalacionId: string | number, fecha: string, deporte: string) => {
  const url = await getBaseUrl();
  const fullUrl = `${url}/reservas/ocupadas?instalacion_id=${instalacionId}&fecha=${encodeURIComponent(fecha)}&deporte=${encodeURIComponent(deporte)}`;
  const res = await fetch(fullUrl, { headers: { 'Cache-Control': 'no-cache' } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const getMisReservas = async (usuarioId: string | number) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/reservas/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const modificarReserva = async (id: string | number, nuevaData: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/reservas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(nuevaData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const cancelarReserva = async (reservaId: string | number) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/reservas/${reservaId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// ── TIENDA ────────────────────────────────────────────────────────────────────

export const getProductos = async () => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/productos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const realizarCompra = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/compras`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

export const devolverCompra = async (compraId: string | number) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/compras/${compraId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// ── ADMINISTRACIÓN ────────────────────────────────────────────────────────────

export const getAdminUsuarios = async () => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/usuarios`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
  return data;
};

export const eliminarUsuario = async (id: number | string) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/usuarios/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  return data;
};

export const crearProductoAdmin = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/productos`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  return await res.json();
};

export const editarProductoAdmin = async (id: number, datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
  return await res.json();
};

export const eliminarProductoAdmin = async (id: number) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/productos/${id}`, { method: 'DELETE' });
  return await res.json();
};

export const crearInstalacionAdmin = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/instalaciones`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  return await res.json();
};

export const editarInstalacionAdmin = async (id: number, datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/instalaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
  return await res.json();
};

export const eliminarInstalacionAdmin = async (id: number) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/instalaciones/${id}`, { method: 'DELETE' });
  return await res.json();
};

export const getEstadisticasAdmin = async () => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/admin/estadisticas`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// ── RECUPERACIÓN DE CONTRASEÑA ────────────────────────────────────────────────

export const recuperarContrasena = async (email: string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/recuperar-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const verificarRecuperacion = async (email: string, codigo: string, nuevaContrasena: string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/recuperar-contrasena/verificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, codigo, nuevaContrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// ── VALORACIONES ──────────────────────────────────────────────────────────────

export const getValoraciones = async (productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/valoraciones/${productoId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const agregarValoracion = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/valoraciones`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const getValoracionesInstalacion = async (instalacionId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/valoraciones-instalaciones/${instalacionId}`);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || 'Error desconocido');
    return data;
  } catch {
    throw new Error(`Respuesta inesperada del servidor (${res.status}): ${text.substring(0, 80)}`);
  }
};

export const agregarValoracionInstalacion = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/valoraciones-instalaciones`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// ── FAVORITOS ─────────────────────────────────────────────────────────────────

export const getFavoritosAPI = async (usuarioId: number | string) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/favoritos/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const agregarFavoritoAPI = async (usuarioId: number | string, productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/favoritos`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, producto_id: productoId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const eliminarFavoritoAPI = async (usuarioId: number | string, productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await apiFetch(`${url}/favoritos/${usuarioId}/${productoId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};
