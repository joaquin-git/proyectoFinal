import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarUsuario } from '../../servicios/api';

export class RegistroService {
  async register(data: any): Promise<any> {
    const resp = await registrarUsuario(data);
    await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify(resp));
    return resp;
  }
}
