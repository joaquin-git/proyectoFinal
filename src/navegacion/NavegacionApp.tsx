import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavegacionAppParams } from '../tipos/Navegacion';
import PantallaMenu from '../pantallas/PantallaMenu';
import PantallaReservaPistas from '../pantallas/PantallaReservaPistas';
import PantallaInfoApp from '../pantallas/PantallaInfoApp';
import PantallaInstalaciones from '../pantallas/PantallaInstalaciones';
import PantallaPerfil from '../pantallas/PantallaPerfil';
import PantallaProductos from '../pantallas/PantallaProductos';
import PantallaSeleccionPista from '../pantallas/PantallaSeleccionPista';
import PantallaReservaDetalle from '../pantallas/PantallaReservaDetalle';
import AjustesPerfil from '../pantallas/AjustesPerfil';
import { useTema } from './NavegacionRaiz';
import PantallaPago from '../pantallas/PantallaPago';
import PantallaAyuda from '../pantallas/PantallaAyuda';
import EnviosDetalle from '../pantallas/EnviosDetalle';
import DevolucionesDetalle from '../pantallas/DevolucionesDetalle';
import TallasDetalle from '../pantallas/TallasDetalle';
import MisCompras from '../pantallas/MisCompras';
import PantallaMinijuego from '../pantallas/PantallaMinijuego';
import PantallaChatIA from '../pantallas/PantallaChatIA';

const Stack = createNativeStackNavigator<NavegacionAppParams>();

export default function NavegacionApp() {
	const { colores } = useTema();

	return (
		<Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.fondoPrincipal } }}>
			<Stack.Screen name="Menu" component={PantallaMenu} />
			<Stack.Screen name="ReservaPistas" component={PantallaReservaPistas} />
			<Stack.Screen name="SeleccionPista" component={PantallaSeleccionPista} />
			<Stack.Screen name="ReservaDetalle" component={PantallaReservaDetalle} />
			<Stack.Screen name="InfoApp" component={PantallaInfoApp} />
			<Stack.Screen name="Instalaciones" component={PantallaInstalaciones} />
			<Stack.Screen name="Perfil" component={PantallaPerfil} />
			<Stack.Screen name="AjustesPerfil" component={AjustesPerfil} />
			<Stack.Screen name="Productos" component={PantallaProductos} />
			<Stack.Screen name="Pago" component={PantallaPago} />
			<Stack.Screen name="Ayuda" component={PantallaAyuda} />
			<Stack.Screen name="EnviosDetalle" component={EnviosDetalle} />
			<Stack.Screen name="DevolucionesDetalle" component={DevolucionesDetalle} />
			<Stack.Screen name="TallasDetalle" component={TallasDetalle} />
			<Stack.Screen name="HistorialCompras" component={MisCompras} />
			<Stack.Screen name="Minijuego" component={PantallaMinijuego} />
			<Stack.Screen name="ChatIA" component={PantallaChatIA} />
		</Stack.Navigator>
	);
}
