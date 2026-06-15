import React from 'react';
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
  Animated,
  TouchableOpacity
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';

const PRECIOS: Record<string, string> = {
  'Pádel': '20€',
  'Fútbol Sala': '50€',
  'Tenis': '10€',
  'Fútbol 7': '70€'
};

export default function PantallaReservaPistas({ route, navigation }: any) {
  const { colores, nombreTema } = useTema();
  const { centro, instalacionId } = route.params || {};

  const deportes = [
    { nombre: 'Fútbol Sala', imagen: require('../../assets/sala.jpg') },
    { nombre: 'Fútbol 7', imagen: require('../../assets/fut7.jpg') },
    { nombre: 'Pádel', imagen: require('../../assets/padel.jpeg') },
    { nombre: 'Tenis', imagen: require('../../assets/tenis.png') },
  ];

  const TarjetaDeporte = ({ item }: { item: any }) => {
    const escala = new Animated.Value(1);

    const alPresionar = () => {
      Animated.spring(escala, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const alSoltar = () => {
      Animated.spring(escala, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: escala }] }}>
        <Pressable
          onPressIn={alPresionar}
          onPressOut={alSoltar}
          onPress={() => {
            navigation.navigate('SeleccionPista', { deporte: item.nombre, centro, instalacionId });
          }}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colores.fondoSecundario,
              borderColor: pressed && nombreTema === 'oscuro' ? colores.primario : 'transparent',
              borderWidth: pressed ? 2 : 0,
            }
          ]}
        >
          {({ pressed }) => (
            <ImageBackground source={item.imagen} style={styles.cardImagen} imageStyle={{ borderRadius: 24 }}>
              <View style={[styles.overlay, { backgroundColor: pressed ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)' }]} />

              <View style={[styles.badgePrecio, { backgroundColor: colores.primario }]}>
                <Text style={styles.textoBadge}>{PRECIOS[item.nombre]}</Text>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.cardTexto}>
                  {item.nombre.startsWith('Fútbol') ? (
                    <Text style={styles.textoResaltado}>{item.nombre}</Text>
                  ) : (
                    <>
                      <Text style={styles.textoResaltado}>{item.nombre.split(' ')[0]}</Text>
                      {item.nombre.includes(' ') ? `\n${item.nombre.split(' ').slice(1).join(' ')}` : ''}
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={[styles.textoVolver, { color: nombreTema === 'oscuro' ? '#FFF' : '#000' }]}>← VOLVER</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: nombreTema === 'oscuro' ? '#FFF' : '#000' }]}>RESERVA TU PISTA</Text>
        <Text style={{ color: colores.textoSecundario, fontSize: 16, marginTop: 5 }}>{centro}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {deportes.map((item, i) => (
            <TarjetaDeporte key={i} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  principal: { flex: 1 },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    paddingBottom: 10,
  },
  botonVolver: { marginBottom: 10, alignSelf: 'flex-start' },
  textoVolver: { fontSize: 14, fontWeight: '900' },
  titulo: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  contenedor: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  grid: { gap: 20 },
  card: { height: 160, borderRadius: 24, overflow: 'hidden' },
  cardImagen: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  badgePrecio: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 3,
  },
  textoBadge: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  contentContainer: { zIndex: 2 },
  cardTexto: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 22,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 28,
  },
  textoResaltado: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  indicador: { width: 40, height: 5, borderRadius: 3, marginTop: 10 },
});
