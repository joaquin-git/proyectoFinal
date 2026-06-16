import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductosService } from '../services/ProductosService';
import { getFavoritosAPI, agregarFavoritoAPI, eliminarFavoritoAPI } from '../../servicios/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1621570277341-3965ff0f55cb?q=80&w=1000';

const mapearProducto = (p: any) => {
  let tallas: string[] | undefined;
  let coloresArr: string[] | undefined;

  if (p.categoria === 'Ropa') {
    tallas = ['S', 'M', 'L', 'XL'];
    coloresArr = ['#FFFFFF', '#000000', '#2196F3', '#FF5252'];
  } else if (p.categoria === 'Pádel' && p.nombre.toLowerCase().includes('pala')) {
    coloresArr = ['#000000', '#FFD700', '#FF5252'];
  } else if (p.categoria === 'Tenis' && p.nombre.toLowerCase().includes('raqueta')) {
    tallas = ['L2', 'L3', 'L4'];
  }

  return {
    ...p,
    id: p.id.toString(),
    precio: parseFloat(p.precio) || 0,
    categoria: p.categoria || 'Otros',
    stock: p.stock > 0,
    stockNum: parseInt(p.stock) || 0,
    imagen: p.imagen || DEFAULT_IMAGE,
    tallas,
    colores: coloresArr,
  };
};

export const useProductosViewModel = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [favoritoIds, setFavoritoIds] = useState<string[]>([]);
  const service = new ProductosService();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const usuarioRaw = await AsyncStorage.getItem('usuarioRegistrado');
      const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

      const [data, favs] = await Promise.all([
        service.fetchProductos(),
        usuario ? getFavoritosAPI(usuario.id).catch(() => []) : Promise.resolve([]),
      ]);
      setProductos(data.map(mapearProducto));
      const ids = (favs as any[]).map((p: any) => p.id.toString());
      setFavoritoIds(ids);
      await AsyncStorage.setItem('favoritos', JSON.stringify(ids));
    } catch (e) {
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const totalCarrito = useMemo(
    () => carrito.reduce((sum: number, item: any) => sum + item.precio, 0),
    [carrito]
  );

  const agregarAlCarrito = (producto: any, talla?: string, color?: string) => {
    const nuevoItem = {
      ...producto,
      tallaSeleccionada: talla,
      colorSeleccionado: color,
      idUnicoCarrito: Date.now().toString(),
    };
    setCarrito(prev => [...prev, nuevoItem]);
  };

  const quitarDelCarrito = (idUnico: string) => {
    setCarrito(prev => prev.filter((item: any) => item.idUnicoCarrito !== idUnico));
  };

  const toggleFavorito = async (productoId: string) => {
    const esFav = favoritoIds.includes(productoId);
    const nuevos = esFav ? favoritoIds.filter(id => id !== productoId) : [...favoritoIds, productoId];
    setFavoritoIds(nuevos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(nuevos));
    try {
      const usuarioRaw = await AsyncStorage.getItem('usuarioRegistrado');
      if (usuarioRaw) {
        const usuario = JSON.parse(usuarioRaw);
        if (esFav) await eliminarFavoritoAPI(usuario.id, productoId);
        else await agregarFavoritoAPI(usuario.id, productoId);
      }
    } catch (e) { /* silencioso: ya actualizamos AsyncStorage */ }
  };

  const isFavorito = (productoId: string) => favoritoIds.includes(productoId);

  return {
    productos,
    productosFiltrados,
    loading,
    error,
    load,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    carrito,
    totalCarrito,
    agregarAlCarrito,
    quitarDelCarrito,
    toggleFavorito,
    isFavorito,
  };
};
