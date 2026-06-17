import { renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { esReservaPasada, usePerfilViewModel } from '../viewmodels/PerfilViewModel';

// Fijar la "hora actual" a 15 de Junio 2026 a las 12:00
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
});

afterAll(() => {
  jest.useRealTimers();
});

// ── Mock de contexto y Alert ──────────────────────────────────────────────────

const mockEliminarReserva = jest.fn();
let mockMisReservas: any[] = [];

jest.mock('../contexto/ReservasContext', () => ({
  useReservas: () => ({
    misReservas: mockMisReservas,
    eliminarReserva: mockEliminarReserva,
  }),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Reservas de prueba ────────────────────────────────────────────────────────

const reservaPasada = {
  id: '1', deporte: 'Tenis', pista: 'Pista 1',
  fecha: 'Lunes 10 de Junio',  hora: '09:00', precio: '10€',
};
const reservaFutura = {
  id: '2', deporte: 'Pádel', pista: 'Pista 2',
  fecha: 'Jueves 20 de Junio', hora: '17:00', precio: '20€',
};

// ── Tests: esReservaPasada (función pura) ─────────────────────────────────────

describe('esReservaPasada', () => {
  it('devuelve true si la fecha y hora ya pasaron', () => {
    expect(esReservaPasada('Lunes 10 de Junio', '09:00')).toBe(true);
  });

  it('devuelve false si la fecha es futura', () => {
    expect(esReservaPasada('Jueves 20 de Junio', '17:00')).toBe(false);
  });

  it('devuelve true si es hoy pero la hora ya pasó', () => {
    expect(esReservaPasada('Lunes 15 de Junio', '08:00')).toBe(true);
  });

  it('devuelve false si es hoy pero la hora no ha llegado', () => {
    expect(esReservaPasada('Lunes 15 de Junio', '18:00')).toBe(false);
  });

  it('devuelve false con formato de fecha inválido', () => {
    expect(esReservaPasada('fecha-inválida', '10:00')).toBe(false);
  });
});

// ── Tests: usePerfilViewModel ─────────────────────────────────────────────────

describe('usePerfilViewModel — reservasActivas y reservasPasadas', () => {
  it('separa correctamente activas y pasadas', () => {
    mockMisReservas = [reservaPasada, reservaFutura];
    const { result } = renderHook(() => usePerfilViewModel({}));
    expect(result.current.reservasActivas).toHaveLength(1);
    expect(result.current.reservasActivas[0].id).toBe('2');
    expect(result.current.reservasPasadas).toHaveLength(1);
    expect(result.current.reservasPasadas[0].id).toBe('1');
  });

  it('todas activas si ninguna ha pasado', () => {
    mockMisReservas = [reservaFutura];
    const { result } = renderHook(() => usePerfilViewModel({}));
    expect(result.current.reservasActivas).toHaveLength(1);
    expect(result.current.reservasPasadas).toHaveLength(0);
  });

  it('gestionarReserva abre un Alert con las opciones', () => {
    mockMisReservas = [reservaFutura];
    const { result } = renderHook(() => usePerfilViewModel({ navigate: jest.fn() }));
    result.current.gestionarReserva(reservaFutura);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Gestionar Reserva',
      expect.stringContaining('Pista 2'),
      expect.any(Array)
    );
  });
});
