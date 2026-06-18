import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMisComprasViewModel } from '../viewmodels/MisComprasViewModel';
import { Compra } from '../tipos/Compra';

const mockFetchCompras = jest.fn();
const mockProcesarDevolucion = jest.fn();

jest.mock('../services/MisComprasService', () => ({
  MisComprasService: jest.fn().mockImplementation(() => ({
    fetchCompras: () => mockFetchCompras(),
    procesarDevolucion: (...args: any[]) => mockProcesarDevolucion(...args),
  })),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (cb: () => void) => { React.useEffect(cb, []); },
  };
});

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const compraEntregada: Compra = {
  id: 'ORD-1234',
  fecha: '18/06/2026',
  productos: [{ nombre: 'Camiseta', precio: 25 }],
  total: 25,
  estado: 'Entregado',
};

const compraDevuelta: Compra = { ...compraEntregada, estado: 'Devuelto' };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockFetchCompras.mockResolvedValue([compraEntregada]);
  mockProcesarDevolucion.mockResolvedValue([compraDevuelta]);
});

// ── Carga ─────────────────────────────────────────────────────────────────────

describe('useMisComprasViewModel — carga', () => {
  it('carga las compras al montar', async () => {
    const { result } = renderHook(() => useMisComprasViewModel());
    await waitFor(() => expect(result.current.compras).toHaveLength(1));
    expect(result.current.compras[0].id).toBe('ORD-1234');
  });
});

// ── Devolución ────────────────────────────────────────────────────────────────

describe('useMisComprasViewModel — procesarDevolucion', () => {
  it('llama al servicio con la compra correcta', async () => {
    const { result } = renderHook(() => useMisComprasViewModel());
    await waitFor(() => expect(result.current.compras).toHaveLength(1));

    await act(async () => { await result.current.procesarDevolucion(compraEntregada); });
    expect(mockProcesarDevolucion).toHaveBeenCalledWith(
      compraEntregada,
      expect.arrayContaining([expect.objectContaining({ id: 'ORD-1234' })])
    );
  });

  it('actualiza el estado de la compra a Devuelto', async () => {
    const { result } = renderHook(() => useMisComprasViewModel());
    await waitFor(() => expect(result.current.compras).toHaveLength(1));

    await act(async () => { await result.current.procesarDevolucion(compraEntregada); });
    await waitFor(() => expect(result.current.compras[0].estado).toBe('Devuelto'));
  });

  it('muestra Alert de confirmación tras la devolución', async () => {
    const { result } = renderHook(() => useMisComprasViewModel());
    await waitFor(() => expect(result.current.compras).toHaveLength(1));

    await act(async () => { await result.current.procesarDevolucion(compraEntregada); });
    expect(Alert.alert).toHaveBeenCalledWith('Solicitud enviada', expect.any(String));
  });
});
