import { getProductos } from '../../servicios/api';

export class ProductosService {
  async fetchProductos(): Promise<any[]> {
    const data = await getProductos();
    return Array.isArray(data) ? data : [];
  }
}
