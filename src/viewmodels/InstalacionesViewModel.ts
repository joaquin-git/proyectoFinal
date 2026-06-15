import { useState, useEffect, useMemo } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { InstalacionesService } from '../services/InstalacionesService';

const DEPORTES_PERMITIDOS = ['Fútbol 7', 'Fútbol Sala', 'Pádel', 'Tenis'];

export const useInstalacionesViewModel = () => {
  const [instalaciones, setInstalaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const service = new InstalacionesService();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await service.fetchInstalaciones();
        setInstalaciones(data);
      } catch (e) {
        console.error('Error cargando instalaciones:', e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const datosFiltrados = useMemo(() => {
    return instalaciones.filter((item: any) => {
      const nombreMatch = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const deportesArr = (typeof item.deportes === 'string' ? JSON.parse(item.deportes) : item.deportes)
        .filter((d: string) => DEPORTES_PERMITIDOS.includes(d));
      const deportesMatch = deportesArr.some((d: string) => d.toLowerCase().includes(busqueda.toLowerCase()));
      return nombreMatch || deportesMatch;
    });
  }, [instalaciones, busqueda]);

  const comoLlegar = (lat: number, lng: number, nombre: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${nombre}@${latLng}`,
      android: `${scheme}${latLng}(${nombre})`,
    });
    Linking.openURL(url || '').catch(() => Alert.alert('Error', 'No se pudo abrir el mapa'));
  };

  const parsearDeportes = (deportes: any): string[] => {
    const arr = typeof deportes === 'string' ? JSON.parse(deportes) : deportes;
    return arr.filter((d: string) => DEPORTES_PERMITIDOS.includes(d));
  };

  return {
    instalaciones,
    datosFiltrados,
    loading,
    busqueda,
    setBusqueda,
    comoLlegar,
    parsearDeportes,
  };
};
