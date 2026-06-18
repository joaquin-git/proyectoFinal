import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { InstalacionesService } from '../services/InstalacionesService';
import { Instalacion } from '../tipos/DatosInstalaciones';

const DEPORTES_PERMITIDOS = ['Fútbol 7', 'Fútbol Sala', 'Pádel', 'Tenis'];
const POR_PAGINA = 6;

export const FILTROS_DEPORTE = ['Todos', ...DEPORTES_PERMITIDOS];

export const useInstalacionesViewModel = () => {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const service = new InstalacionesService();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await service.fetchInstalaciones();
      setInstalaciones(data);
    } catch (e) {
      setError('No se pudieron cargar las instalaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const parsearDeportes = (deportes: string | string[]): string[] => {
    const arr = typeof deportes === 'string' ? JSON.parse(deportes) : deportes;
    return (arr as string[]).filter(d => DEPORTES_PERMITIDOS.includes(d));
  };

  const datosFiltrados = useMemo(() => {
    return instalaciones.filter((item: Instalacion) => {
      const deportesArr = parsearDeportes(item.deportes);
      const coincideDeporte = deporteSeleccionado === 'Todos' || deportesArr.includes(deporteSeleccionado);
      const coincideBusqueda = busqueda === '' ||
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        deportesArr.some(d => d.toLowerCase().includes(busqueda.toLowerCase()));
      return coincideDeporte && coincideBusqueda;
    });
  }, [instalaciones, busqueda, deporteSeleccionado]);

  useEffect(() => { setPaginaActual(1); }, [busqueda, deporteSeleccionado]);

  const datosVisibles = useMemo(
    () => datosFiltrados.slice(0, paginaActual * POR_PAGINA),
    [datosFiltrados, paginaActual]
  );

  const hayMas = datosVisibles.length < datosFiltrados.length;

  const cargarMas = useCallback(() => {
    if (hayMas) setPaginaActual(prev => prev + 1);
  }, [hayMas]);

  const comoLlegar = (lat: number, lng: number, nombre: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${nombre}@${latLng}`,
      android: `${scheme}${latLng}(${nombre})`,
    });
    Linking.openURL(url || '').catch(() => Alert.alert('Error', 'No se pudo abrir el mapa'));
  };

  return {
    instalaciones,
    datosFiltrados,
    datosVisibles,
    hayMas,
    cargarMas,
    loading,
    error,
    load,
    busqueda,
    setBusqueda,
    deporteSeleccionado,
    setDeporteSeleccionado,
    comoLlegar,
    parsearDeportes,
  };
};
