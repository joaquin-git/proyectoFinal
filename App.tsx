import React, { useEffect } from 'react';
import NavegacionRaiz from './src/navegacion/NavegacionRaiz';
import { initializeAPI } from './servicios/api';

export default function App() {
  useEffect(() => {
    // Inicializar la configuración del API cuando la app inicia
    initializeAPI().catch(error => console.error('Error inicializando API:', error));
  }, []);

  return <NavegacionRaiz />;
}