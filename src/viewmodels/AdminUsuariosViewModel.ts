import { useState } from 'react';
import { getAdminUsuarios, eliminarUsuario } from '../../servicios/api';
import { UsuarioAdmin } from '../tipos/Usuario';

export const useAdminUsuariosViewModel = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
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

  const deleteUser = async (id: number) => {
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
