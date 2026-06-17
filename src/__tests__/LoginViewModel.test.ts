import { renderHook, act } from '@testing-library/react-native';
import { useLoginViewModel } from '../viewmodels/LoginViewModel';

const mockLogin = jest.fn();
const mockCargarReservas = jest.fn();

jest.mock('../services/AuthService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    login: mockLogin,
  })),
}));

jest.mock('../contexto/ReservasContext', () => ({
  useReservas: () => ({ cargarReservas: mockCargarReservas }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCargarReservas.mockResolvedValue(undefined);
});

describe('useLoginViewModel — validación', () => {
  it('muestra error en email y password si ambos están vacíos', async () => {
    const { result } = renderHook(() => useLoginViewModel());
    await act(async () => { result.current.login(); });
    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeTruthy();
  });

  it('muestra solo error de email si password tiene valor', async () => {
    const { result } = renderHook(() => useLoginViewModel());
    act(() => { result.current.setPassword('pass123'); });
    await act(async () => { result.current.login(); });
    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.password).toBeUndefined();
  });

  it('muestra solo error de password si email tiene valor', async () => {
    const { result } = renderHook(() => useLoginViewModel());
    act(() => { result.current.setEmail('usuario@test.com'); });
    await act(async () => { result.current.login(); });
    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBeTruthy();
  });

  it('no llama al servicio si la validación falla', async () => {
    const { result } = renderHook(() => useLoginViewModel());
    await act(async () => { result.current.login(); });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe('useLoginViewModel — login exitoso', () => {
  const mockUser = { id: 1, usuario: 'juan', rol: 'user' };

  beforeEach(() => {
    mockLogin.mockResolvedValue(mockUser);
  });

  it('llama a onAuthenticated con el usuario devuelto por el servicio', async () => {
    const onAuthenticated = jest.fn();
    const { result } = renderHook(() => useLoginViewModel(onAuthenticated));
    act(() => {
      result.current.setEmail('juan');
      result.current.setPassword('pass123');
    });
    await act(async () => { await result.current.login(); });
    expect(onAuthenticated).toHaveBeenCalledWith(mockUser);
  });

  it('loading es true durante el login y false al terminar', async () => {
    let resolver!: (v: any) => void;
    mockLogin.mockImplementation(() => new Promise(r => { resolver = r; }));

    const { result } = renderHook(() => useLoginViewModel());
    act(() => {
      result.current.setEmail('juan');
      result.current.setPassword('pass123');
    });
    act(() => { result.current.login(); });
    expect(result.current.loading).toBe(true);
    await act(async () => { resolver(mockUser); });
    expect(result.current.loading).toBe(false);
  });

  it('llama a cargarReservas tras un login exitoso', async () => {
    const { result } = renderHook(() => useLoginViewModel());
    act(() => {
      result.current.setEmail('juan');
      result.current.setPassword('pass123');
    });
    await act(async () => { await result.current.login(); });
    expect(mockCargarReservas).toHaveBeenCalledTimes(1);
  });
});

describe('useLoginViewModel — login fallido', () => {
  it('muestra el mensaje de error del servicio en errors.password', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = renderHook(() => useLoginViewModel());
    act(() => {
      result.current.setEmail('juan');
      result.current.setPassword('wrongpass');
    });
    await act(async () => { await result.current.login(); });
    expect(result.current.errors.password).toBe('Credenciales inválidas');
    expect(result.current.loading).toBe(false);
  });

  it('no llama a onAuthenticated si el login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Error'));
    const onAuthenticated = jest.fn();
    const { result } = renderHook(() => useLoginViewModel(onAuthenticated));
    act(() => {
      result.current.setEmail('juan');
      result.current.setPassword('pass');
    });
    await act(async () => { await result.current.login(); });
    expect(onAuthenticated).not.toHaveBeenCalled();
  });
});
