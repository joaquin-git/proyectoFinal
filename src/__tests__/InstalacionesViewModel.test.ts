import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useInstalacionesViewModel } from '../viewmodels/InstalacionesViewModel';

const mockFetchInstalaciones = jest.fn();

jest.mock('../services/InstalacionesService', () => ({
  InstalacionesService: jest.fn().mockImplementation(() => ({
    fetchInstalaciones: mockFetchInstalaciones,
  })),
}));

// 7 instalaciones para forzar paginación (POR_PAGINA = 6)
const mockInstalaciones = [
  { id: 1, nombre: 'Pista Norte',         deportes: JSON.stringify(['Tenis', 'Pádel']),          lat: 40.4, lng: -3.7 },
  { id: 2, nombre: 'Campo Sur',           deportes: JSON.stringify(['Fútbol 7', 'Fútbol Sala']),  lat: 40.5, lng: -3.8 },
  { id: 3, nombre: 'Centro Oeste',        deportes: JSON.stringify(['Pádel']),                    lat: 40.3, lng: -3.9 },
  { id: 4, nombre: 'Pabellón Central',    deportes: JSON.stringify(['Tenis']),                    lat: 40.6, lng: -3.6 },
  { id: 5, nombre: 'Polideportivo Este',  deportes: JSON.stringify(['Fútbol 7', 'Tenis']),        lat: 40.7, lng: -3.5 },
  { id: 6, nombre: 'Zona Deportiva',      deportes: JSON.stringify(['Pádel', 'Fútbol Sala']),     lat: 40.2, lng: -4.0 },
  { id: 7, nombre: 'Club Raqueta',        deportes: JSON.stringify(['Tenis', 'Pádel']),           lat: 40.8, lng: -3.4 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInstalaciones.mockResolvedValue(mockInstalaciones);
});

describe('useInstalacionesViewModel — carga', () => {
  it('empieza en estado de carga', () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    expect(result.current.loading).toBe(true);
  });

  it('carga las 7 instalaciones correctamente', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.instalaciones).toHaveLength(7);
  });

  it('establece error si el servicio falla', async () => {
    mockFetchInstalaciones.mockRejectedValueOnce(new Error('Sin conexión'));
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No se pudieron cargar las instalaciones');
  });
});

describe('useInstalacionesViewModel — filtrado', () => {
  it('filtra instalaciones por nombre', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setBusqueda('Pista'); });
    expect(result.current.datosFiltrados).toHaveLength(1);
    expect(result.current.datosFiltrados[0].nombre).toBe('Pista Norte');
  });

  it('filtra instalaciones por deporte', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setBusqueda('Tenis'); });
    // Pista Norte (1), Pabellón Central (4), Polideportivo Este (5), Club Raqueta (7)
    expect(result.current.datosFiltrados).toHaveLength(4);
  });

  it('sin búsqueda muestra todas las instalaciones', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.datosFiltrados).toHaveLength(7);
  });
});

describe('useInstalacionesViewModel — paginación', () => {
  it('muestra 6 instalaciones en la primera página', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.datosVisibles).toHaveLength(6);
    expect(result.current.hayMas).toBe(true);
  });

  it('cargarMas muestra las 7 instalaciones', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.cargarMas(); });
    expect(result.current.datosVisibles).toHaveLength(7);
    expect(result.current.hayMas).toBe(false);
  });

  it('resetea paginación al cambiar búsqueda', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.cargarMas(); });
    act(() => { result.current.setBusqueda('Pista'); });
    expect(result.current.datosVisibles).toHaveLength(1);
    expect(result.current.hayMas).toBe(false);
  });
});

describe('useInstalacionesViewModel — parsearDeportes', () => {
  it('filtra solo los deportes permitidos', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const deportes = result.current.parsearDeportes(['Tenis', 'Baloncesto', 'Pádel', 'Ciclismo']);
    expect(deportes).toEqual(['Tenis', 'Pádel']);
  });

  it('acepta deportes ya parseados (array)', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const deportes = result.current.parsearDeportes(['Fútbol 7', 'Fútbol Sala']);
    expect(deportes).toEqual(['Fútbol 7', 'Fútbol Sala']);
  });

  it('acepta deportes como JSON string', async () => {
    const { result } = renderHook(() => useInstalacionesViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const deportes = result.current.parsearDeportes(JSON.stringify(['Tenis', 'Rugby']));
    expect(deportes).toEqual(['Tenis']);
  });
});
