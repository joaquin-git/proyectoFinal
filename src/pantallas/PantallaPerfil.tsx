import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Animated
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';
import { Ionicons } from '@expo/vector-icons';
import { usePerfilViewModel, esReservaPasada } from '../viewmodels/PerfilViewModel';

export default function PantallaPerfil({ navigation }: any) {
  const { colores, nombreTema } = useTema();
  const alturaStatusBar = StatusBar.currentHeight || 0;
  const { reservasActivas, reservasPasadas, gestionarReserva } = usePerfilViewModel(navigation);

  const TarjetaReservaInteractiva = ({ res }: { res: any }) => {
    const escala = new Animated.Value(1);
    const pasada = esReservaPasada(res.fecha, res.hora);

    const alPresionar = () => {
      if (pasada) return;
      Animated.spring(escala, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const alSoltar = () => {
      if (pasada) return;
      Animated.spring(escala, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
      gestionarReserva(res);
    };

    return (
      <Animated.View style={{ transform: [{ scale: escala }], opacity: pasada ? 0.8 : 1 }}>
        <Pressable
          onPressIn={alPresionar}
          onPressOut={alSoltar}
          disabled={pasada}
          style={({ pressed }) => [
            styles.tarjetaReserva,
            {
              backgroundColor: pasada ? 'rgba(40,40,40,0.6)' : 'rgba(30,30,30,0.9)',
              borderColor: pasada
                ? 'rgba(255,255,255,0.05)'
                : pressed && nombreTema === 'oscuro'
                  ? colores.primario
                  : nombreTema === 'oscuro'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.1)',
              borderWidth: pressed ? 2 : 1.5,
              elevation: pressed ? 10 : 4,
            }
          ]}
        >
          <View style={[styles.indicadorColor, { backgroundColor: pasada ? '#555' : colores.primario }]} />
          <View style={styles.infoReserva}>
            <Text style={[styles.deportePista, { color: pasada ? '#CCC' : '#FFFFFF' }]} numberOfLines={2}>
              {res.deporte} - {res.pista}
            </Text>
            <Text style={[styles.fechaHora, { color: pasada ? '#666' : 'rgba(255,255,255,0.6)' }]}>
              {res.fecha} • {res.hora}
            </Text>
          </View>

          <View style={styles.contenedorDerecho}>
            {pasada ? (
              <View style={styles.badgePasada}>
                <Ionicons name="checkmark-circle" size={12} color="#AAA" style={{ marginRight: 4 }} />
                <Text style={styles.textoBadgePasada}>CUMPLIDA</Text>
              </View>
            ) : (
              <View style={styles.contenedorPrecio}>
                <Text style={styles.precioTag}>{res.precio}</Text>
              </View>
            )}
            {pasada && (
              <Text style={[styles.precioPasado, { color: '#888' }]}>{res.precio}</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.principal, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/vestuario.jpg')}
        style={styles.principal}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          style={styles.contenedor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === 'android' ? alturaStatusBar + 10 : 20 }
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.botonVolver}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.textoVolver}>← Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.titulo, { color: '#FFFFFF' }]}>Reservas</Text>

          <View style={styles.seccionReservas}>
            <Text style={[styles.subtitulo, { color: 'rgba(255,255,255,0.8)' }]}>Mis Reservas Activas</Text>

            {reservasActivas.length === 0 ? (
              <View style={[styles.tarjetaVacia, { backgroundColor: 'rgba(25,25,25,0.8)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={[styles.textoVacio, { color: '#FFFFFF', opacity: 0.6 }]}>No tienes reservas activas.</Text>
              </View>
            ) : (
              reservasActivas.map((res) => (
                <TarjetaReservaInteractiva key={res.id} res={res} />
              ))
            )}
          </View>

          {reservasPasadas.length > 0 && (
            <View style={[styles.seccionReservas, { marginTop: 30 }]}>
              <Text style={[styles.subtitulo, { color: 'rgba(255,255,255,0.6)' }]}>Historial de Reservas</Text>
              {reservasPasadas.map((res) => (
                <TarjetaReservaInteractiva key={res.id} res={res} />
              ))}
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  principal: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  contenedor: { flex: 1 },
  scrollContent: { padding: 25 },
  botonVolver: { marginBottom: 15, alignSelf: 'flex-start' },
  textoVolver: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  titulo: { fontSize: 32, fontWeight: '900', marginBottom: 25, letterSpacing: -0.5 },
  seccionReservas: { marginTop: 10 },
  subtitulo: { fontSize: 18, fontWeight: '700', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  tarjetaVacia: { padding: 40, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  textoVacio: { fontSize: 16, textAlign: 'center' },
  tarjetaReserva: { borderRadius: 18, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, borderWidth: 1.5 },
  indicadorColor: { width: 6, height: 45, borderRadius: 10, marginRight: 18 },
  infoReserva: { flex: 1 },
  deportePista: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  fechaHora: { fontSize: 14, marginTop: 6, fontWeight: '500' },
  contenedorDerecho: { alignItems: 'flex-end', justifyContent: 'center' },
  badgePasada: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textoBadgePasada: { color: '#AAA', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  precioPasado: { fontSize: 12, fontWeight: '700', marginTop: 4, opacity: 0.8 },
  contenedorPrecio: { marginLeft: 10 },
  precioTag: { fontSize: 15, fontWeight: '900', color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, overflow: 'hidden' },
});
