import { renderHook, act } from '@testing-library/react-native';
import { useRegistroViewModel } from '../viewmodels/RegistroViewModel';
import { DatosRegistro } from '../tipos/DatosRegistro';

const mockRegister = jest.fn();

jest.mock('../services/RegistroService', () => ({
  RegistroService: jest.fn().mockImplementation(() => ({
    register: (...args: any[]) => mockRegister(...args),
  })),
}));

const datosValidos: DatosRegistro = {
  nombre: 'Juan',
  apellidos: 'García López',
  fechaNacimiento: '15/06/1995',
  dni: '12345678Z',
  telefono: '600000001',
  email: 'juan@test.com',
  usuario: 'juangar',
  contrasena: 'Segura1A2',
  confirmarContrasena: 'Segura1A2',
  calle: 'Calle Mayor',
  numeroCasa: '5',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRegister.mockResolvedValue({ id: 1, usuario: 'juangar' });
});

// ── Validación ────────────────────────────────────────────────────────────────

describe('useRegistroViewModel — validación', () => {
  it('genera errores cuando los campos obligatorios están vacíos', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    const datosVacios = {} as DatosRegistro;
    await act(async () => { await result.current.register(datosVacios); });
    expect(result.current.errors.nombre).toBeTruthy();
    expect(result.current.errors.correo).toBeTruthy();
    expect(result.current.errors.contrasena).toBeTruthy();
  });

  it('genera error de correo si el email es inválido', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => {
      await result.current.register({ ...datosValidos, email: 'no-es-email' });
    });
    expect(result.current.errors.correo).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('genera error de DNI si el DNI es incorrecto', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => {
      await result.current.register({ ...datosValidos, dni: '00000000A' });
    });
    expect(result.current.errors.dni).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('genera error si las contraseñas no coinciden', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => {
      await result.current.register({ ...datosValidos, confirmarContrasena: 'Diferente9B' });
    });
    expect(result.current.errors.confirmarContrasena).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('genera error si la contraseña es débil', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => {
      await result.current.register({ ...datosValidos, contrasena: '1234', confirmarContrasena: '1234' });
    });
    expect(result.current.errors.contrasena).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

// ── Registro exitoso ──────────────────────────────────────────────────────────

describe('useRegistroViewModel — registro exitoso', () => {
  it('retorna true y llama al servicio con datos válidos', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    let retorno: boolean = false;
    await act(async () => { retorno = await result.current.register(datosValidos); });
    expect(retorno).toBe(true);
    expect(mockRegister).toHaveBeenCalledTimes(1);
  });

  it('no hay errores tras un registro exitoso', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => { await result.current.register(datosValidos); });
    expect(Object.keys(result.current.errors).length).toBe(0);
  });
});

// ── Registro fallido y limpiarError ──────────────────────────────────────────

describe('useRegistroViewModel — registro fallido y utilidades', () => {
  it('lanza el error del servicio si el registro falla', async () => {
    mockRegister.mockRejectedValue(new Error('Usuario ya existe'));
    const { result } = renderHook(() => useRegistroViewModel());
    await expect(
      act(async () => { await result.current.register(datosValidos); })
    ).rejects.toThrow('Usuario ya existe');
  });

  it('limpiarError elimina el error del campo indicado', async () => {
    const { result } = renderHook(() => useRegistroViewModel());
    await act(async () => { await result.current.register({} as DatosRegistro); });
    expect(result.current.errors.nombre).toBeTruthy();
    act(() => { result.current.limpiarError('nombre'); });
    expect(result.current.errors.nombre).toBeFalsy();
  });
});
