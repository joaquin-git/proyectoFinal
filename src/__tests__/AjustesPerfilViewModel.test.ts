import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAjustesPerfilViewModel } from '../viewmodels/AjustesPerfilViewModel';

const mockActualizarUsuario = jest.fn();

jest.mock('../../servicios/api', () => ({
  actualizarUsuario: (...args: any[]) => mockActualizarUsuario(...args),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const mockUsuario = {
  id: 1,
  nombre: 'Juan García',
  usuario: 'juangar',
  email: 'juan@test.com',
  foto: null,
  telefono: '600000001',
  password: 'pass123',
};

beforeEach(async () => {
  jest.clearAllMocks();
  mockActualizarUsuario.mockResolvedValue({});
  await AsyncStorage.clear();
  await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(mockUsuario));
});

// ── Carga de datos ────────────────────────────────────────────────────────────

describe('useAjustesPerfilViewModel — carga', () => {
  it('carga los datos del usuario desde AsyncStorage al montar', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));
    expect(result.current.usuario.correo).toBe('juan@test.com');
    expect(result.current.usuario.nombre_persona).toBe('Juan García');
  });

  it('initializa con estado vacío antes de cargar', () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    expect(result.current.usuario.usuario).toBe('');
  });
});

// ── Validación ────────────────────────────────────────────────────────────────

describe('useAjustesPerfilViewModel — validación', () => {
  it('llama a onError si el correo tiene formato inválido', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    act(() => {
      result.current.setUsuario({ ...result.current.usuario, correo: 'correo-invalido' });
    });

    const onError = jest.fn();
    await act(async () => { await result.current.guardarCambios(jest.fn(), onError); });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockActualizarUsuario).not.toHaveBeenCalled();
  });

  it('llama a onError si la nueva contraseña no coincide con la confirmación', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    act(() => {
      result.current.setUsuario({
        ...result.current.usuario,
        passwordNueva: 'nueva123',
        passwordConfirmar: 'diferente456',
        passwordActual: 'pass123',
      });
    });

    const onError = jest.fn();
    await act(async () => { await result.current.guardarCambios(jest.fn(), onError); });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('llama a onError si la contraseña actual no es correcta', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    act(() => {
      result.current.setUsuario({
        ...result.current.usuario,
        passwordNueva: 'nueva123',
        passwordConfirmar: 'nueva123',
        passwordActual: 'incorrecta',
      });
    });

    const onError = jest.fn();
    await act(async () => { await result.current.guardarCambios(jest.fn(), onError); });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

// ── Guardado exitoso ──────────────────────────────────────────────────────────

describe('useAjustesPerfilViewModel — guardarCambios', () => {
  it('llama a onSuccess y a la API al guardar sin cambio de contraseña', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    const onSuccess = jest.fn();
    await act(async () => { await result.current.guardarCambios(onSuccess, jest.fn()); });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockActualizarUsuario).toHaveBeenCalledTimes(1);
  });

  it('llama a onSuccess cuando el cambio de contraseña es válido', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    act(() => {
      result.current.setUsuario({
        ...result.current.usuario,
        passwordNueva: 'nueva123',
        passwordConfirmar: 'nueva123',
        passwordActual: 'pass123',
      });
    });

    const onSuccess = jest.fn();
    await act(async () => { await result.current.guardarCambios(onSuccess, jest.fn()); });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('persiste los datos actualizados en AsyncStorage', async () => {
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    act(() => {
      result.current.setUsuario({ ...result.current.usuario, nombre_persona: 'Juan Actualizado' });
    });

    await act(async () => { await result.current.guardarCambios(jest.fn(), jest.fn()); });

    const stored = await AsyncStorage.getItem('usuarioRegistrado');
    const parsed = JSON.parse(stored!);
    expect(parsed.nombre).toBe('Juan Actualizado');
  });

  it('llama a onError si la API falla', async () => {
    mockActualizarUsuario.mockRejectedValue(new Error('Error de red'));
    const { result } = renderHook(() => useAjustesPerfilViewModel());
    await waitFor(() => expect(result.current.usuario.usuario).toBe('juangar'));

    const onError = jest.fn();
    await act(async () => { await result.current.guardarCambios(jest.fn(), onError); });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
