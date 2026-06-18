import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValoracionesInstalacion, agregarValoracionInstalacion } from '../../servicios/api';
import { Valoracion } from '../tipos/Valoracion';

export const useValoracionesInstalacionViewModel = (instalacionId: string) => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [miPuntuacion, setMiPuntuacion] = useState(0);
  const [miComentario, setMiComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const load = useCallback(async () => {
    if (!instalacionId) return;
    setLoading(true);
    setMiPuntuacion(0);
    setMiComentario('');
    try {
      const data = await getValoracionesInstalacion(instalacionId);
      setValoraciones(data.valoraciones || []);
      setMedia(data.media);

      const usuarioRaw = await AsyncStorage.getItem('usuarioRegistrado');
      if (usuarioRaw) {
        const usuario = JSON.parse(usuarioRaw);
        const mia = (data.valoraciones as Valoracion[]).find(v => v.usuario_id === usuario.id);
        if (mia) {
          setMiPuntuacion(mia.puntuacion);
          setMiComentario(mia.comentario || '');
        }
      }
    } catch (e: any) {
      console.error('Error cargando valoraciones de instalación:', e?.message ?? e);
    } finally {
      setLoading(false);
    }
  }, [instalacionId]);

  const enviarValoracion = async (): Promise<boolean> => {
    if (miPuntuacion === 0) return false;
    setEnviando(true);
    try {
      const usuarioRaw = await AsyncStorage.getItem('usuarioRegistrado');
      if (!usuarioRaw) return false;
      const usuario = JSON.parse(usuarioRaw);
      await agregarValoracionInstalacion({
        usuario_id: usuario.id,
        instalacion_id: instalacionId,
        puntuacion: miPuntuacion,
        comentario: miComentario,
        fecha: new Date().toLocaleDateString('es-ES'),
      });
      await load();
      return true;
    } catch (e) {
      console.error('Error enviando valoración de instalación:', e);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  return {
    valoraciones, media, loading,
    miPuntuacion, setMiPuntuacion,
    miComentario, setMiComentario,
    enviando, load, enviarValoracion,
  };
};
