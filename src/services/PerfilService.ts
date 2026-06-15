import AsyncStorage from '@react-native-async-storage/async-storage';

export class PerfilService {
  async fetchPerfil(): Promise<any> {
    const datos = await AsyncStorage.getItem('usuarioRegistrado');
    return datos ? JSON.parse(datos) : null;
  }
}
