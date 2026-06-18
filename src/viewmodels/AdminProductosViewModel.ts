import { useState } from 'react';
import { getProductos, crearProductoAdmin, editarProductoAdmin, eliminarProductoAdmin } from '../../servicios/api';
import { ProductoAdmin } from '../tipos/Producto';

export const useAdminProductosViewModel = () => {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
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

  const saveProduct = async (id: number | null, datos: Partial<ProductoAdmin>) => {
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
