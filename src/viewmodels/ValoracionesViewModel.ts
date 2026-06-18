import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValoraciones, agregarValoracion } from '../../servicios/api';
import { Valoracion } from '../tipos/Valoracion';

export const useValoracionesViewModel = (productoId: string) => {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [miPuntuacion, setMiPuntuacion] = useState(0);
  const [miComentario, setMiComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const load = useCallback(async () => {
    if (!productoId) return;
    setLoading(true);
    setMiPuntuacion(0);
    setMiComentario('');
    try {
      const data = await getValoraciones(productoId);
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
    } catch (e) {
      console.error('Error cargando valoraciones:', e);
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  const enviarValoracion = async (): Promise<boolean> => {
    if (miPuntuacion === 0) return false;
    setEnviando(true);
    try {
      const usuarioRaw = await AsyncStorage.getItem('usuarioRegistrado');
      if (!usuarioRaw) return false;
      const usuario = JSON.parse(usuarioRaw);
      await agregarValoracion({
        usuario_id: usuario.id,
        producto_id: productoId,
        puntuacion: miPuntuacion,
        comentario: miComentario,
        fecha: new Date().toLocaleDateString('es-ES'),
      });
      await load();
      return true;
    } catch (e) {
      console.error('Error enviando valoración:', e);
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
