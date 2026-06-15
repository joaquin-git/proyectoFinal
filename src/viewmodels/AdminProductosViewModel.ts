import { useState } from 'react';
import { getProductos, crearProductoAdmin, editarProductoAdmin, eliminarProductoAdmin } from '../../servicios/api';

export const useAdminProductosViewModel = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProductos();
      setProductos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (id: number | null, datos: any) => {
    try {
      if (id) await editarProductoAdmin(id, datos);
      else await crearProductoAdmin(datos);
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await eliminarProductoAdmin(id);
      await load();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { productos, loading, load, saveProduct, deleteProduct };
};

