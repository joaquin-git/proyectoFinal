import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Pressable,
  Animated
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';
import IconoPelota from '../componentes/IconoPelota';

export default function PantallaSeleccionPista({ route, navigation }: any) {
  const { colores, nombreTema } = useTema();

  const { deporte, centro, instalacionId } = route.params;

  const mapaDeFondos: { [key: string]: any } = {
    'Fútbol Sala': require('../../assets/sala.jpg'),
    'Fútbol 7': require('../../assets/fut7.jpg'),
    'Pádel': require('../../assets/padel.jpeg'),
    'Tenis': require('../../assets/tenis.png'),
  };

  const imagenFondo = mapaDeFondos[deporte] || require('../../assets/sala.jpg');

  const obtenerPistas = () => {
    if (deporte === 'Pádel') return [1, 2, 3, 4];
    return [1, 2];
  };

  const listaPistas = obtenerPistas();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const TarjetaPistaSencilla = ({ numPista }: { numPista: number }) => {
    const escala = new Animated.Value(1);

    const alPresionar = () => {
      Animated.spring(escala, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const alSoltar = () => {
      Animated.spring(escala, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: escala }] }}>
        <Pressable
          onPressIn={alPresionar}
          onPressOut={alSoltar}
          onPress={() => {
            navigation.navigate('ReservaDetalle', { deporte, pista: `Pista ${numPista}`, centro, instalacionId });
          }}
          delayLongPress={100}
          style={({ pressed }) => [
            styles.tarjetaPista,
            {
              backgroundColor: '#1A1A1A',
              borderColor: pressed && nombreTema === 'oscuro'
                ? colores.primario
                : nombreTema === 'oscuro'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.1)',
              borderWidth: pressed ? 2 : 1.5,
              elevation: pressed ? 12 : 6,
            }
          ]}
        >
          <View style={[styles.indicadorTema, { backgroundColor: colores.primario }]} />

          <View style={styles.infoPista}>
            <View style={styles.areaIcono}>
              <View style={styles.circuloIcono}>
                <IconoPelota deporte={deporte} />
              </View>
            </View>

            <View style={styles.textosPista}>
              <Text style={styles.textoNombrePista}>
                PISTA <Text style={styles.numeroPista}>{numPista}</Text>
              </Text>
              <Text style={styles.textoDisponibilidad}>Disponible para reservar</Text>
            </View>
          </View>

          <Text style={styles.flecha}>→</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.principal, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={imagenFondo} style={styles.principal} resizeMode="cover">
        <View style={styles.overlayPrincipal} />

        <View style={styles.contenido}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.botonVolver}
            >
              <Text style={styles.textoVolver}>← Volver</Text>
            </TouchableOpacity>

            <View style={styles.titulosContenedor}>
              <Text style={styles.subtituloHeader}>{deporte.toUpperCase()}</Text>
              <Text style={styles.tituloSeccion}>Selecciona una pista</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.gridPistas}>
              {listaPistas.map((numPista) => (
                <TarjetaPistaSencilla key={numPista} numPista={numPista} />
              ))}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  principal: { flex: 1 },
  contenido: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 2,
  },
  overlayPrincipal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  botonVolver: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  textoVolver: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titulosContenedor: { marginTop: 5 },
  subtituloHeader: {
    color: '#F4F4F4',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8,
  },
  tituloSeccion: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 3,
  },
  scrollContent: { paddingBottom: 30 },
  gridPistas: {
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 10,
  },
  tarjetaPista: {
    height: 110,
    width: '100%',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  indicadorTema: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderRadius: 2,
  },
  infoPista: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  areaIcono: { marginRight: 15 },
  circuloIcono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textosPista: { flex: 1 },
  textoNombrePista: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  numeroPista: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  textoDisponibilidad: {
    color: '#2ECC71',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  flecha: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 10,
  }
});
