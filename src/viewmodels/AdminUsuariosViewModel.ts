import { useState } from 'react';
import { getAdminUsuarios, eliminarUsuario } from '../../servicios/api';

export const useAdminUsuariosViewModel = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsuarios();
      setUsuarios(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: any) => {
    try {
      await eliminarUsuario(id);
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { usuarios, loading, load, deleteUser };
};

