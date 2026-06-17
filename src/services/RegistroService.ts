import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarUsuario } from '../../servicios/api';

export class RegistroService {
  async register(data: any): Promise<any> {
    // El backend devuelve { token, refreshToken, usuario }
    const resp = await registrarUsuario(data);
    await AsyncStorage.setItem('authToken', resp.token);
    await AsyncStorage.setItem('refreshToken', resp.refreshToken);
    await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(resp.usuario));
    return resp.usuario;
  }
}
