import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, LoginResult } from '../models/LoginModel';
import { loginUsuario as loginUsuarioApi, registrarUsuario as registrarUsuarioApi } from '../../servicios/api';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const resp = await loginUsuarioApi(credentials.email, credentials.password);
    await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(resp));
    return resp as LoginResult;
  }

  async register(datos: any): Promise<LoginResult> {
    const resp = await registrarUsuarioApi(datos);
    await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(resp));
    return resp as LoginResult;
  }
}
