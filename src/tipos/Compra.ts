export interface ProductoCompra {
  id?: string | number;
  nombre: string;
  precio?: number;
}

export interface Compra {
  id: string;
  fecha: string;
  productos: (ProductoCompra | string)[];
  total: number;
  estado: string;
  imagen?: string;
}
