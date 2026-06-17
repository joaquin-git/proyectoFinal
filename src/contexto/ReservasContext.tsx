import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearReserva, getMisReservas, modificarReserva, cancelarReserva } from '../../servicios/api';
interface Reserva {
  id: string;
  deporte: string;
  pista: string;
  fecha: string;
  hora: string;
  precio: string;
  instalacionId?: string | number | null;
}

interface ReservasContextType {
  misReservas: Reserva[];
  agregarReserva: (reserva: Omit<Reserva, 'precio'> & { precio?: string }) => Promise<void>;
  eliminarReserva: (id: string) => void;
  actualizarReserva: (id: string, nuevaData: Partial<Reserva>) => void;
  cargarReservas: () => Promise<void>;
  limpiarReservas: () => void;
}

const PRECIOS: Record<string, string> = {
  'Pádel': '20€',
  'Fútbol Sala': '50€',
  'Tenis': '10€',
  'Fútbol 7': '70€'
};

const ReservasContext = createContext<ReservasContextType | undefined>(undefined);

export const ReservasProvider = ({ children }: { children: React.ReactNode }) => {
  const [misReservas, setMisReservas] = useState<Reserva[]>([]);

  const cargarReservas = async () => {
    try {
      const datos = await AsyncStorage.getItem('usuarioRegistrado');
      const token = await AsyncStorage.getItem('authToken');
      if (datos && token) {
        const u = JSON.parse(datos);
        const misRegs = await getMisReservas(u.id);
        setMisReservas(misRegs);
      } else {
        setMisReservas([]);
      }
    } catch (err) {
      setMisReservas([]);
    }
  };

  const limpiarReservas = () => {
    setMisReservas([]);
  };

  useEffect(() => { cargarReservas(); }, []);

  const agregarReserva = async (reserva: Omit<Reserva, 'precio'> & { precio?: string }) => {
    const precioFinal = reserva.precio || PRECIOS[reserva.deporte] || '0€';
    try {
      const datos = await AsyncStorage.getItem('usuarioRegistrado');
      if (datos) {
        const u = JSON.parse(datos);
        const resData = await crearReserva({
          usuario_id: u.id,
          instalacion_id: reserva.instalacionId ? parseInt(reserva.instalacionId.toString()) : null,
          deporte: reserva.deporte,
          pista: reserva.pista,
          fecha: reserva.fecha,
          hora: reserva.hora,
          precio: precioFinal
        });

        if (resData && resData.id) {
          const nuevaReserva: Reserva = { ...reserva, id: resData.id.toString(), precio: precioFinal };
          setMisReservas((prev) => [nuevaReserva, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error al guardar en DB:", error);
      throw error;
    }
  };

  const eliminarReserva = async (id: string) => {
    try { await cancelarReserva(id); } catch (err) { console.log('Error al borrar en API', err); }
    setMisReservas((prev) => prev.filter((res) => res.id.toString() !== id.toString()));
  };

  const actualizarReserva = async (id: string, nuevaData: Partial<Reserva>) => {
    try { await modificarReserva(id, nuevaData); } catch (err) { console.log('Error al actualizar en API', err); }
    setMisReservas((prev) => prev.map((res) => (res.id.toString() === id.toString() ? { ...res, ...nuevaData } : res)));
  };

  return (
    <ReservasContext.Provider value={{ misReservas, agregarReserva, eliminarReserva, actualizarReserva, cargarReservas, limpiarReservas }}>
      {children}
    </ReservasContext.Provider>
  );
};

export const useReservas = () => {
  const context = useContext(ReservasContext);
  if (!context) throw new Error('useReservas debe usarse dentro de un ReservasProvider');
  return context;
};
