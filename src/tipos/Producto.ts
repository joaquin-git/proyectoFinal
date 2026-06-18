export interface ProductoRaw {
  id: string | number;
  nombre: string;
  precio: string | number;
  categoria?: string;
  stock: number;
  imagen?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stock: boolean;
  stockNum: number;
  imagen: string;
  tallas?: string[];
  colores?: string[];
}

export interface ItemCarrito extends Producto {
  tallaSeleccionada?: string;
  colorSeleccionado?: string;
  idUnicoCarrito: string;
}

export interface ProductoAdmin {
  id?: number;
  nombre: string;
  precio: string | number;
  categoria?: string;
  stock: number;
  imagen?: string;
}
