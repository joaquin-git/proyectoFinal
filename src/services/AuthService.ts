import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, LoginResult } from '../models/LoginModel';
import { loginUsuario as loginUsuarioApi } from '../../servicios/api';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    // El backend devuelve { token, refreshToken, usuario }
    const resp = await loginUsuarioApi(credentials.email, credentials.password);
    await AsyncStorage.setItem('authToken', resp.token);
    await AsyncStorage.setItem('refreshToken', resp.refreshToken);
    await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(resp.usuario));
    return resp.usuario as LoginResult;
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'usuarioRegistrado']);
  }
}
