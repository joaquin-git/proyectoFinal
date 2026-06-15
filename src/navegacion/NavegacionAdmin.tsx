import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTema } from './NavegacionRaiz';
import AdminUsuarios from '../pantallas/admin/AdminUsuarios';
import AdminProductos from '../pantallas/admin/AdminProductos';
import AdminInstalaciones from '../pantallas/admin/AdminInstalaciones';
import AdminAjustes from '../pantallas/admin/AdminAjustes';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
	const { colores } = useTema();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: { backgroundColor: colores.toolbar, borderTopColor: colores.bordeSuave, height: 85, paddingBottom: 25, paddingTop: 10 },
				tabBarActiveTintColor: colores.primario,
				tabBarInactiveTintColor: colores.textoSecundario,
				tabBarIcon: ({ color, size }) => {
					if (route.name === 'Usuarios') return <FontAwesome5 name="users" size={size} color={color} />;
					if (route.name === 'Productos') return <MaterialIcons name="storefront" size={size} color={color} />;
					if (route.name === 'Instalaciones') return <Ionicons name="business" size={size} color={color} />;
					if (route.name === 'Salir') return <Ionicons name="log-out-outline" size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Usuarios" component={AdminUsuarios} />
			<Tab.Screen name="Productos" component={AdminProductos} />
			<Tab.Screen name="Instalaciones" component={AdminInstalaciones} />
			<Tab.Screen name="Salir" component={AdminAjustes} />
		</Tab.Navigator>
	);
}

export default function NavegacionAdmin() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="AdminTabs" component={AdminTabs} />
		</Stack.Navigator>
	);
}
