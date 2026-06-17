/**
 * SERVICIO DE COMUNICACIÓN CON LA API (Frontend)
 * Este archivo centraliza todas las peticiones HTTP que la aplicación hace al servidor.
 * Usamos 'fetch' para enviar y recibir datos de la base de datos MySQL.
 */

import { serverConfig } from '../src/config/serverConfig';

// Nota: BASE_URL es dinámico, se obtiene en cada llamada
let BASE_URL: string = '';

/**
 * Inicializa la URL base del servidor
 */
export const initializeAPI = async () => {
  BASE_URL = await serverConfig.getBaseUrl();
};

/**
 * Obtiene la URL base actual
 */
const getBaseUrl = async () => {
  if (!BASE_URL) {
    BASE_URL = await serverConfig.getBaseUrl();
  }
  return BASE_URL;
};

// --- FUNCIONES DE USUARIO ---

// Registrar un nuevo perfil en la base de datos
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

// Validar credenciales de acceso
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

// Actualizar los datos personales o la foto del usuario
export const actualizarUsuario = async (id: string | number, datos: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// --- FUNCIONES DE INSTALACIONES Y RESERVAS ---

// Obtener todos los centros deportivos disponibles
export const getInstalaciones = async () => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/instalaciones`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Crear una nueva reserva de pista
export const crearReserva = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Consultar qué pistas y horas están ya pilladas para no duplicar reservas
export const getReservasOcupadas = async (instalacionId: string | number, fecha: string, deporte: string) => {
  const url = await getBaseUrl();
  const fullUrl = `${url}/reservas/ocupadas?instalacion_id=${instalacionId}&fecha=${encodeURIComponent(fecha)}&deporte=${encodeURIComponent(deporte)}`;
  const res = await fetch(fullUrl, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Ver el historial de reservas de un usuario concreto
export const getMisReservas = async (usuarioId: string | number) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/reservas/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Modificar una reserva existente
export const modificarReserva = async (id: string | number, nuevaData: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/reservas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Cancelar/Eliminar una reserva
export const cancelarReserva = async (reservaId: string | number) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/reservas/${reservaId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// --- FUNCIONES DE TIENDA ---

// Obtener catálogo de productos
export const getProductos = async () => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/productos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Registrar una compra y descontar stock
export const realizarCompra = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// Eliminar/Devolver una compra de la base de datos
export const devolverCompra = async (compraId: string | number) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/compras/${compraId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detalle || data.error || 'Error desconocido');
  return data;
};

// --- FUNCIONES DE ADMINISTRACIÓN ---

// Obtener lista de todos los usuarios (solo para Admin)
export const getAdminUsuarios = async () => {
  const res = await fetch(`${BASE_URL}/admin/usuarios`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener usuarios');
  return data;
};

export const eliminarUsuario = async (id: number | string) => {
  const res = await fetch(`${BASE_URL}/admin/usuarios/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  return data;
};

// Crear/Editar/Eliminar Productos (Panel Admin)
export const crearProductoAdmin = async (datos: any) => {
  const res = await fetch(`${BASE_URL}/admin/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return await res.json();
};

export const editarProductoAdmin = async (id: number, datos: any) => {
  const res = await fetch(`${BASE_URL}/admin/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return await res.json();
};

export const eliminarProductoAdmin = async (id: number) => {
  const res = await fetch(`${BASE_URL}/admin/productos/${id}`, { method: 'DELETE' });
  return await res.json();
};

// Crear/Editar/Eliminar Instalaciones (Panel Admin)
export const crearInstalacionAdmin = async (datos: any) => {
  const res = await fetch(`${BASE_URL}/admin/instalaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return await res.json();
};

export const editarInstalacionAdmin = async (id: number, datos: any) => {
  const res = await fetch(`${BASE_URL}/admin/instalaciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return await res.json();
};

export const eliminarInstalacionAdmin = async (id: number) => {
  const res = await fetch(`${BASE_URL}/admin/instalaciones/${id}`, { method: 'DELETE' });
  return await res.json();
};

// --- RECUPERACIÓN DE CONTRASEÑA ---

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

// --- DASHBOARD ADMIN ---

export const getEstadisticasAdmin = async () => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/admin/estadisticas`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// --- VALORACIONES ---

export const getValoraciones = async (productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/valoraciones/${productoId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const agregarValoracion = async (datos: any) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/valoraciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// --- VALORACIONES INSTALACIONES ---

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
  const res = await fetch(`${url}/valoraciones-instalaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

// --- FAVORITOS ---

export const getFavoritosAPI = async (usuarioId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/favoritos/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const agregarFavoritoAPI = async (usuarioId: number | string, productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId, producto_id: productoId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};

export const eliminarFavoritoAPI = async (usuarioId: number | string, productoId: number | string) => {
  const url = await getBaseUrl();
  const res = await fetch(`${url}/favoritos/${usuarioId}/${productoId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconocido');
  return data;
};
