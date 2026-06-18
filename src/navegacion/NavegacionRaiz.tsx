import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NavegacionAuth from './NavegacionAuth';
import NavegacionApp from './NavegacionApp';
import NavegacionAdmin from './NavegacionAdmin';
import { temaClaro, temaOscuro, NombreTema } from '../estilos/tema';
import { ReservasProvider } from '../contexto/ReservasContext';
import { ToastProvider } from '../contexto/ToastContext';
import BannerSinConexion from '../componentes/BannerSinConexion';

export const TemaContext = React.createContext<{
	nombreTema: NombreTema;
	toggleTema: () => void;
	colores: typeof temaClaro;
	setEstaAutenticado: (val: boolean) => void;
	usuarioRol: string | null;
	setUsuarioRol: (rol: string | null) => void;
} | null>(null);

export function useTema() {
	const ctx = React.useContext(TemaContext);
	if (!ctx) throw new Error("useTema debe usarse dentro de TemaContext.Provider");
	return ctx;
}

type NavegacionRaizParams = {
	Auth: undefined;
	App: undefined;
	Admin: undefined;
};

const Stack = createNativeStackNavigator<NavegacionRaizParams>();

export default function NavegacionRaiz() {
	const [estaAutenticado, setEstaAutenticado] = useState(false);
	const [usuarioRol, setUsuarioRol] = useState<string | null>(null);
	const [nombreTema, setNombreTema] = useState<NombreTema>('claro');

	const colores = nombreTema === 'claro' ? temaClaro : temaOscuro;

	const toggleTema = () => { setNombreTema(prev => (prev === 'claro' ? 'oscuro' : 'claro')); };

	const contexto = useMemo(() => ({ nombreTema, toggleTema, colores, setEstaAutenticado, usuarioRol, setUsuarioRol }), [nombreTema, colores, estaAutenticado, usuarioRol]);

	return (
		<TemaContext.Provider value={contexto}>
			<ToastProvider>
			<ReservasProvider>
				<View style={{ flex: 1 }}>
					<NavigationContainer>
						<Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 250 }}>
							{estaAutenticado ? (
								usuarioRol === 'admin' ? (
									<Stack.Screen name="Admin" component={NavegacionAdmin} />
								) : (
									<Stack.Screen name="App" component={NavegacionApp} />
								)
							) : (
								<Stack.Screen name="Auth">
									{(props) => (
										<NavegacionAuth {...props} setEstaAutenticado={setEstaAutenticado} />
									)}
								</Stack.Screen>
							)}
						</Stack.Navigator>
					</NavigationContainer>
					<BannerSinConexion />
				</View>
			</ReservasProvider>
			</ToastProvider>
		</TemaContext.Provider>
	);
}
