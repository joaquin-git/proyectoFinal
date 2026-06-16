import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const SERVER_CONFIGS = {
  development_local: {
    name: 'Desarrollo (Localhost)',
    url: Platform.OS === 'android' 
      ? 'http://10.0.2.2:3000/api'
      : 'http://localhost:3000/api',
    description: 'Para emulador Android o desarrollo local'
  },
  development_network: {
    name: 'Desarrollo (Red Local)',
    url: 'http://192.168.1.50:3000/api',
    description: 'Para dispositivo físico en la misma red wifi'
  },
  production: {
    name: 'Producción',
    url: 'https://tudominio.com/api',
    description: 'Servidor en producción'
  }
};

const STORAGE_KEY = 'SERVER_CONFIG_URL';
const DEFAULT_CONFIG = SERVER_CONFIGS.development_network.url;

class ServerConfig {
  private currentUrl: string | null = null;

  async getBaseUrl(): Promise<string> {
    if (!this.currentUrl) {
      try {
        const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
        this.currentUrl = savedUrl || DEFAULT_CONFIG;
      } catch (error) {
        console.warn('Error al leer servidor guardado, usando default:', error);
        this.currentUrl = DEFAULT_CONFIG;
      }
    }
    return this.currentUrl;
  }

  async setBaseUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, url);
      this.currentUrl = url;
      console.log('✅ URL del servidor actualizada:', url);
    } catch (error) {
      console.error('❌ Error al guardar URL del servidor:', error);
      throw error;
    }
  }

  async resetToDefault(): Promise<void> {
    await this.setBaseUrl(DEFAULT_CONFIG);
  }

  getAvailableConfigs() {
    return SERVER_CONFIGS;
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${url}/ping`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Error de conexión:', error);
      return false;
    }
  }
}

export const serverConfig = new ServerConfig();
