import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaRegistro from '../pantallas/PantallaRegistro';
import RecuperarContrasena from '../pantallas/RecuperarContrasena';
import PantallaOnboarding from '../pantallas/PantallaOnboarding';

export type NavegacionAuthParams = {
  Onboarding: undefined;
  Login: undefined;
  Registro: undefined;
  RecuperarContrasena: undefined;
};

interface NavegacionAuthProps { setEstaAutenticado: (v: boolean) => void; }

const Stack = createNativeStackNavigator<NavegacionAuthParams>();

export default function NavegacionAuth({ setEstaAutenticado }: NavegacionAuthProps) {
  const [cargando, setCargando] = useState(true);
  const [onboardingVisto, setOnboardingVisto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboardingVisto').then(val => {
      setOnboardingVisto(!!val);
      setCargando(false);
    });
  }, []);

  if (cargando) return null;

  return (
    <Stack.Navigator
      initialRouteName={onboardingVisto ? 'Login' : 'Onboarding'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={PantallaOnboarding} />
      <Stack.Screen name="Login">
        {(props) => <PantallaLogin {...props} setEstaAutenticado={setEstaAutenticado} />}
      </Stack.Screen>
      <Stack.Screen name="Registro" component={PantallaRegistro} />
      <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasena} />
    </Stack.Navigator>
  );
}
