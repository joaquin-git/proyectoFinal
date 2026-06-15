import React, { useCallback } from 'react';
import { 
	View, 
	Text, 
	StyleSheet, 
	ScrollView, 
	ImageBackground, 
	Pressable, 
	SafeAreaView, 
	Platform, 
	StatusBar,
	Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toolbar from '../componentes/Toolbar';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useMenuViewModel } from '../viewmodels/MenuViewModel';

export default function PantallaMenu({ navigation }: { navigation: any }) {
	const opciones = [
		{ titulo: 'Nuestras instalaciones', imagen: require('../../assets/instalaciones.png'), destino: 'Instalaciones' },
		{ titulo: 'Mis Reservas', imagen: require('../../assets/perfil.png'), destino: 'Perfil' },
		{ titulo: 'Productos', imagen: require('../../assets/productos.jpg'), destino: 'Productos' },
		{ titulo: 'Mis Compras', imagen: require('../../assets/compras.png'), destino: 'HistorialCompras' }, 
		{ titulo: 'Minijuego', imagen: require('../../assets/minijuego.jpg'), destino: 'Minijuego' },
		{ titulo: 'Información de la app', imagen: require('../../assets/informacion.png'), destino: 'InfoApp' },
	];

	const { nombreTema, toggleTema, colores } = useTema();
	const { usuario, load } = useMenuViewModel();

	useFocusEffect(
		useCallback(() => {
			load();
		}, [])
	);

	const BotonInteractuable = ({ op }: { op: any }) => {
		const escala = new Animated.Value(1);
		const alPresionar = () => { Animated.spring(escala, { toValue: 0.96, useNativeDriver: true }).start(); };
		const alSoltar = () => { Animated.spring(escala, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start(); };

		return (
			<Animated.View style={{ transform: [{ scale: escala }] }}>
				<Pressable
					onPressIn={alPresionar}
					onPressOut={alSoltar}
					onPress={() => op.destino && navigation.navigate(op.destino)}
					style={({ pressed }) => [
						styles.card,
						{ 
							backgroundColor: colores.fondoSecundario, 
							borderColor: pressed 
								? (nombreTema === 'oscuro' ? colores.primario : 'rgba(0, 0, 0, 0.2)')
								: (nombreTema === 'oscuro' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)'),
							borderWidth: pressed ? 2 : 1.5,
						}
					]}
				>
					{({ pressed }) => (
						<ImageBackground source={op.imagen} style={styles.cardImagen} imageStyle={{ borderRadius: 24 }}>
							<View style={[styles.overlay, { backgroundColor: pressed ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.35)' }]} />
              
							<View style={styles.contentContainer}>
								<Text style={styles.cardTexto}>
									{(op.titulo === 'Nuestras instalaciones' || op.titulo === 'Mis Reservas' || op.titulo === 'Mis Compras') ? (
										<>
											{op.titulo.split(' ')[0]}{'\n'}
											<Text style={styles.textoResaltado}>{op.titulo.split(' ')[1]}</Text>
										</>
									) : (
										<>
											<Text style={styles.textoResaltado}>{op.titulo.split(' ')[0]}</Text>
											{op.titulo.includes(' ') ? `\n${op.titulo.split(' ').slice(1).join(' ')}` : ''}
										</>
									)}
								</Text>
								<View style={[styles.indicador, { backgroundColor: colores.primario }]} />
							</View>
						</ImageBackground>
					)}
				</Pressable>
			</Animated.View>
		);
	};

	return (
		<SafeAreaView style={[styles.principal, { backgroundColor: colores.fondoPrincipal }]}>
			<View style={styles.safeToolbar}>
				<Toolbar
					titulo="MENÚ"
					nombreTema={nombreTema}
					onToggleTema={toggleTema}
					usuario={usuario?.usuario}
					foto={usuario?.foto}
				/>   
			</View>

			<ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
				<View style={styles.grid}>
					{opciones.map((op, i) => <BotonInteractuable key={i} op={op} />)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	principal: { flex: 1 },
	safeToolbar: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
	contenedor: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
	grid: { gap: 20 },
	card: { height: 150, borderRadius: 24, overflow: 'hidden' },
	cardImagen: { flex: 1, justifyContent: 'flex-end', padding: 25 },
	overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
	contentContainer: { zIndex: 2 },
	cardTexto: { 
		color: 'rgba(255,255,255,0.8)', 
		fontSize: 20, 
		fontWeight: '600', 
		textTransform: 'uppercase', 
		letterSpacing: 1,
		lineHeight: 24,
	},
	textoResaltado: {
		color: '#FFFFFF',
		fontSize: 30,
		fontWeight: '900',
		letterSpacing: -1,
	},
	indicador: { width: 45, height: 5, borderRadius: 3, marginTop: 10 },
});
