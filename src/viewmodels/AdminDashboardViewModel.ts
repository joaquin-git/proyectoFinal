import { useState, useCallback } from 'react';
import { getEstadisticasAdmin } from '../../servicios/api';

export interface EstadisticasAdmin {
  totalUsuarios: number;
  totalReservas: number;
  totalCompras: number;
  ingresosTotales: number;
  reservasPorDeporte: { deporte: string; total: number }[];
  productosMasVendidos: { nombre: string; vendidos: number }[];
  productosStockBajo: { id: number; nombre: string; stock: number }[];
}

export const useAdminDashboardViewModel = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEstadisticasAdmin();
      setEstadisticas(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  return { estadisticas, loading, error, load };
};
