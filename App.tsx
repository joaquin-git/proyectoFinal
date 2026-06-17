import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import NavegacionRaiz from './src/navegacion/NavegacionRaiz';
import { initializeAPI } from './servicios/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    initializeAPI().catch(error => console.error('Error inicializando API:', error));
  }, []);

  return <NavegacionRaiz />;
}