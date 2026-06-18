import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductosService } from '../services/ProductosService';
import { getFavoritosAPI, agregarFavoritoAPI, eliminarFavoritoAPI } from '../../servicios/api';
import { Producto, ProductoRaw, ItemCarrito } from '../tipos/Producto';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1621570277341-3965ff0f55cb?q=80&w=1000';
const POR_PAGINA = 10;

const mapearProducto = (p: ProductoRaw): Producto => {
  let tallas: string[] | undefined;
  let coloresArr: string[] | undefined;

  if (p.categoria === 'Ropa') {
    tallas = ['S', 'M', 'L', 'XL'];
    coloresArr = ['#FFFFFF', '#000000', '#2196F3', '#FF5252'];
  } else if (p.categoria === 'Pádel' && String(p.nombre).toLowerCase().includes('pala')) {
    coloresArr = ['#000000', '#FFD700', '#FF5252'];
  } else if (p.categoria === 'Tenis' && String(p.nombre).toLowerCase().includes('raqueta')) {
    tallas = ['L2', 'L3', 'L4'];
  }

  return {
    ...p,
    id: p.id.toString(),
    precio: parseFloat(String(p.precio)) || 0,
    categoria: p.categoria || 'Otros',
    stock: Number(p.stock) > 0,
    stockNum: parseInt(String(p.stock)) || 0,
    imagen: p.imagen || DEFAULT_IMAGE,
    tallas,
    colores: coloresArr,
  };
};

export const useProductosViewModel = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [favoritoIds, setFavoritoIds] = useState<string[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
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
      setProductos((data as ProductoRaw[]).map(mapearProducto));
      const ids = (favs as Producto[]).map(p => p.id.toString());
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

  useEffect(() => { setPaginaActual(1); }, [busqueda, categoriaSeleccionada]);

  const productosVisibles = useMemo(
    () => productosFiltrados.slice(0, paginaActual * POR_PAGINA),
    [productosFiltrados, paginaActual]
  );

  const hayMas = productosVisibles.length < productosFiltrados.length;

  const cargarMas = useCallback(() => {
    if (hayMas) setPaginaActual(prev => prev + 1);
  }, [hayMas]);

  const totalCarrito = useMemo(
    () => carrito.reduce((sum, item) => sum + item.precio, 0),
    [carrito]
  );

  const agregarAlCarrito = (producto: Producto, talla?: string, color?: string) => {
    const nuevoItem: ItemCarrito = {
      ...producto,
      tallaSeleccionada: talla,
      colorSeleccionado: color,
      idUnicoCarrito: Date.now().toString(),
    };
    setCarrito(prev => [...prev, nuevoItem]);
  };

  const quitarDelCarrito = (idUnico: string) => {
    setCarrito(prev => prev.filter(item => item.idUnicoCarrito !== idUnico));
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
    productosVisibles,
    hayMas,
    cargarMas,
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
