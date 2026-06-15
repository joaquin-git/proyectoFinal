import { useState } from 'react';
import { getInstalaciones, crearInstalacionAdmin, editarInstalacionAdmin, eliminarInstalacionAdmin } from '../../servicios/api';

export const useAdminInstalacionesViewModel = () => {
  const [instalaciones, setInstalaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInstalaciones();
      setInstalaciones(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveInstalacion = async (id: number | null, datos: any) => {
    try {
      if (id) await editarInstalacionAdmin(id, datos);
      else await crearInstalacionAdmin(datos);
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteInstalacion = async (id: number) => {
    try {
      await eliminarInstalacionAdmin(id);
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { instalaciones, loading, load, saveInstalacion, deleteInstalacion };
};

