import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductosViewModel } from '../viewmodels/ProductosViewModel';

const mockFetchProductos = jest.fn();

jest.mock('../services/ProductosService', () => ({
  ProductosService: jest.fn().mockImplementation(() => ({
    fetchProductos: mockFetchProductos,
  })),
}));

jest.mock('../../servicios/api', () => ({
  getFavoritosAPI: jest.fn().mockResolvedValue([]),
  agregarFavoritoAPI: jest.fn().mockResolvedValue({}),
  eliminarFavoritoAPI: jest.fn().mockResolvedValue({}),
}));

const makeProd = (id: number, nombre: string, categoria: string, precio: number, stock: number) => ({
  id,
  nombre,
  precio: precio.toString(),
  categoria,
  stock,
  imagen: null,
});

// 12 productos para forzar paginación (POR_PAGINA = 10)
const mockProductos = [
  makeProd(1,  'Raqueta Wilson',    'Tenis',  59.99, 5),
  makeProd(2,  'Raqueta Babolat',   'Tenis',  79.99, 3),
  makeProd(3,  'Pala Bullpadel',    'Pádel',  89.99, 0),
  makeProd(4,  'Pala Nox',          'Pádel',  99.99, 2),
  makeProd(5,  'Camiseta Sport',    'Ropa',   29.99, 10),
  makeProd(6,  'Zapatillas Run',    'Otros',  49.99, 8),
  makeProd(7,  'Pelota Tenis',      'Tenis',   4.99, 20),
  makeProd(8,  'Red Pádel',         'Pádel',  19.99, 6),
  makeProd(9,  'Muñequera',         'Otros',   9.99, 15),
  makeProd(10, 'Botella Sport',     'Otros',  14.99, 12),
  makeProd(11, 'Grip Pro Tenis',     'Tenis',   7.99, 30),
  makeProd(12, 'Bolsa Deporte',     'Otros',  24.99, 7),
];

beforeEach(() => {
  mockFetchProductos.mockResolvedValue(mockProductos);
  jest.clearAllMocks();
  mockFetchProductos.mockResolvedValue(mockProductos);
});

describe('useProductosViewModel — carga', () => {
  it('empieza en estado de carga', () => {
    const { result } = renderHook(() => useProductosViewModel());
    expect(result.current.loading).toBe(true);
  });

  it('carga los 12 productos correctamente', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.productos).toHaveLength(12);
  });

  it('establece error si el servicio falla', async () => {
    mockFetchProductos.mockRejectedValueOnce(new Error('Red caída'));
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No se pudieron cargar los productos');
  });
});

describe('useProductosViewModel — filtrado', () => {
  it('filtra por nombre de búsqueda', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setBusqueda('raqueta'); });
    expect(result.current.productosFiltrados).toHaveLength(2);
  });

  it('filtra por categoría', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setCategoriaSeleccionada('Tenis'); });
    // Raqueta Wilson, Raqueta Babolat, Pelota Tenis, Grip Raqueta
    expect(result.current.productosFiltrados).toHaveLength(4);
  });

  it('muestra todos con categoría Todos', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setCategoriaSeleccionada('Todos'); });
    expect(result.current.productosFiltrados).toHaveLength(12);
  });
});

describe('useProductosViewModel — paginación', () => {
  it('muestra 10 productos en la primera página', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.productosVisibles).toHaveLength(10);
    expect(result.current.hayMas).toBe(true);
  });

  it('cargarMas muestra los 12 productos y hayMas pasa a false', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.cargarMas(); });
    expect(result.current.productosVisibles).toHaveLength(12);
    expect(result.current.hayMas).toBe(false);
  });

  it('resetea paginación al cambiar búsqueda', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.cargarMas(); });
    expect(result.current.productosVisibles).toHaveLength(12);
    act(() => { result.current.setBusqueda('raqueta'); });
    // Con 2 resultados, todos caben en una página
    expect(result.current.productosVisibles).toHaveLength(2);
    expect(result.current.hayMas).toBe(false);
  });
});

describe('useProductosViewModel — carrito', () => {
  it('añade un producto al carrito', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.agregarAlCarrito(result.current.productosVisibles[0]); });
    expect(result.current.carrito).toHaveLength(1);
  });

  it('calcula totalCarrito correctamente', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const [p1, p2] = result.current.productosVisibles;
    act(() => {
      result.current.agregarAlCarrito(p1);
      result.current.agregarAlCarrito(p2);
    });
    expect(result.current.totalCarrito).toBeCloseTo(p1.precio + p2.precio, 2);
  });

  it('quita un producto del carrito por id único', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.agregarAlCarrito(result.current.productosVisibles[0]); });
    const idUnico = result.current.carrito[0].idUnicoCarrito;
    act(() => { result.current.quitarDelCarrito(idUnico); });
    expect(result.current.carrito).toHaveLength(0);
  });

  it('el carrito empieza vacío y totalCarrito es 0', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.carrito).toHaveLength(0);
    expect(result.current.totalCarrito).toBe(0);
  });
});

describe('useProductosViewModel — favoritos', () => {
  it('isFavorito devuelve false para producto no guardado', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isFavorito('1')).toBe(false);
  });

  it('toggleFavorito añade el producto a favoritos', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.toggleFavorito('1'); });
    expect(result.current.isFavorito('1')).toBe(true);
  });

  it('toggleFavorito quita el producto si ya era favorito', async () => {
    const { result } = renderHook(() => useProductosViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.toggleFavorito('1'); });
    await act(async () => { await result.current.toggleFavorito('1'); });
    expect(result.current.isFavorito('1')).toBe(false);
  });
});
