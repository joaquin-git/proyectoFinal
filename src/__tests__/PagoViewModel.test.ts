import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePagoViewModel } from '../viewmodels/PagoViewModel';
import { ItemCarrito } from '../tipos/Producto';
import { Reserva } from '../tipos/Reserva';

const mockProcesarCompra = jest.fn();
const mockAgregarReserva = jest.fn();

jest.mock('../services/PagoService', () => ({
  PagoService: jest.fn().mockImplementation(() => ({
    procesarCompra: (...args: any[]) => mockProcesarCompra(...args),
  })),
}));

jest.mock('../contexto/ReservasContext', () => ({
  useReservas: () => ({ agregarReserva: mockAgregarReserva }),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockProductos: ItemCarrito[] = [
  {
    id: '1', nombre: 'Camiseta', precio: 25, categoria: 'Ropa',
    stock: true, stockNum: 10, imagen: 'img.png',
    idUnicoCarrito: 'unico-1',
  },
];

const mockReserva: Reserva = {
  id: 'res-1',
  deporte: 'Pádel',
  pista: 'Pista 1',
  fecha: 'Lunes, 20 Junio',
  hora: '10:00',
  precio: '20€',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockProcesarCompra.mockResolvedValue(undefined);
  mockAgregarReserva.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
});

// ── Validación de datos de pago ───────────────────────────────────────────────

describe('usePagoViewModel — validar', () => {
  it('retorna error si la tarjeta tiene menos de 16 dígitos', () => {
    const { result } = renderHook(() => usePagoViewModel());
    const error = result.current.validar('tarjeta', '1234', '12/26', '123', '');
    expect(error).toBeTruthy();
  });

  it('retorna error si la tarjeta no tiene caducidad o CVV', () => {
    const { result } = renderHook(() => usePagoViewModel());
    const error = result.current.validar('tarjeta', '1234567890123456', '', '', '');
    expect(error).toBeTruthy();
  });

  it('retorna error si el teléfono Bizum es demasiado corto', () => {
    const { result } = renderHook(() => usePagoViewModel());
    const error = result.current.validar('bizum', '', '', '', '123');
    expect(error).toBeTruthy();
  });

  it('retorna null con datos de tarjeta válidos', () => {
    const { result } = renderHook(() => usePagoViewModel());
    const error = result.current.validar('tarjeta', '1234567890123456', '12/26', '123', '');
    expect(error).toBeNull();
  });

  it('retorna null con Bizum válido', () => {
    const { result } = renderHook(() => usePagoViewModel());
    const error = result.current.validar('bizum', '', '', '', '600000001');
    expect(error).toBeNull();
  });
});

// ── pagarCarrito ──────────────────────────────────────────────────────────────

describe('usePagoViewModel — pagarCarrito', () => {
  it('llama a onSuccess tras el pago del carrito', async () => {
    const { result } = renderHook(() => usePagoViewModel());
    const onSuccess = jest.fn();
    await act(async () => {
      result.current.pagarCarrito(mockProductos, 25, 'tarjeta', onSuccess);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('muestra Alert si el servicio lanza un error', async () => {
    mockProcesarCompra.mockRejectedValue(new Error('Error de red'));
    const { result } = renderHook(() => usePagoViewModel());
    await act(async () => {
      await result.current.pagarCarrito(mockProductos, 25, 'tarjeta', jest.fn());
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
  });
});

// ── pagarReserva ──────────────────────────────────────────────────────────────

describe('usePagoViewModel — pagarReserva', () => {
  it('llama a onSuccess tras pagar la reserva', async () => {
    const { result } = renderHook(() => usePagoViewModel());
    const onSuccess = jest.fn();
    await act(async () => {
      await result.current.pagarReserva(mockReserva, onSuccess);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockAgregarReserva).toHaveBeenCalledWith(expect.objectContaining({ deporte: 'Pádel' }));
  });

  it('muestra Alert si agregarReserva lanza un error', async () => {
    mockAgregarReserva.mockRejectedValue(new Error('Sin conexión'));
    const { result } = renderHook(() => usePagoViewModel());
    await act(async () => {
      await result.current.pagarReserva(mockReserva, jest.fn());
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
  });
});
