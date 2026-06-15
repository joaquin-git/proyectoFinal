import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaRegistro from '../pantallas/PantallaRegistro';

export type NavegacionAuthParams = { Login: undefined; Registro: undefined };

interface NavegacionAuthProps { setEstaAutenticado: (v: boolean) => void; }

const Stack = createNativeStackNavigator<NavegacionAuthParams>();

export default function NavegacionAuth({ setEstaAutenticado }: NavegacionAuthProps) {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Login">{(props) => <PantallaLogin {...props} setEstaAutenticado={setEstaAutenticado} />}</Stack.Screen>
			<Stack.Screen name="Registro" component={PantallaRegistro} />
		</Stack.Navigator>
	);
}
