import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    titulo: 'BIENVENIDO A\nSPORTSPACE',
    descripcion: 'Tu plataforma para reservar pistas deportivas y descubrir las mejores instalaciones de la ciudad.',
    icono: 'trophy-outline' as const,
    color: '#E63946',
    imagen: require('../../assets/sustitucion.jpg'),
  },
  {
    id: '2',
    titulo: 'RESERVA\nTU PISTA',
    descripcion: 'Consulta disponibilidad en tiempo real y reserva en segundos. Pádel, tenis, fútbol sala y más.',
    icono: 'calendar-outline' as const,
    color: '#4A90E2',
    imagen: require('../../assets/instalaciones.png'),
  },
  {
    id: '3',
    titulo: 'TIENDA\nDEPORTIVA',
    descripcion: 'Encuentra todo el equipamiento que necesitas: ropa, raquetas, balones y complementos.',
    icono: 'cart-outline' as const,
    color: '#2ECC71',
    imagen: require('../../assets/productos.jpg'),
  },
  {
    id: '4',
    titulo: '¡EMPIEZA\nAHORA!',
    descripcion: 'Únete a SportSpace y lleva tu deporte al siguiente nivel. Es gratis.',
    icono: 'rocket-outline' as const,
    color: '#FF9800',
    imagen: require('../../assets/login.png'),
  },
];

export default function PantallaOnboarding({ navigation }: any) {
  const [indice, setIndice] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finalizar = async () => {
    await AsyncStorage.setItem('onboardingVisto', '1');
    navigation.replace('Login');
  };

  const siguiente = () => {
    if (indice < SLIDES.length - 1) {
      const siguiente = indice + 1;
      flatListRef.current?.scrollToIndex({ index: siguiente, animated: true });
      setIndice(siguiente);
    } else {
      finalizar();
    }
  };

  const colorActual = SLIDES[indice].color;
  const esUltimo = indice === SLIDES.length - 1;

  return (
    <View style={styles.contenedor}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndice(idx);
        }}
        renderItem={({ item }) => (
          <ImageBackground source={item.imagen} style={[styles.slide, { width }]} resizeMode="cover">
            <View style={styles.overlay} />
            <View style={[styles.overlayColor, { backgroundColor: item.color + '22' }]} />

            <View style={styles.contenidoSlide}>
              <View style={[styles.iconoCirculo, { borderColor: item.color + '60', backgroundColor: item.color + '25' }]}>
                <Ionicons name={item.icono} size={72} color={item.color} />
              </View>
              <Text style={[styles.titulo, { color: '#FFF' }]}>{item.titulo}</Text>
              <View style={[styles.lineaAcento, { backgroundColor: item.color }]} />
              <Text style={styles.descripcion}>{item.descripcion}</Text>
            </View>
          </ImageBackground>
        )}
      />

      <SafeAreaView style={[styles.footer, Platform.OS === 'android' && { paddingBottom: 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === indice
                  ? { backgroundColor: colorActual, width: 28 }
                  : { backgroundColor: 'rgba(255,255,255,0.3)', width: 8 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btnSiguiente, { backgroundColor: colorActual }]}
          onPress={siguiente}
          activeOpacity={0.85}
        >
          <Text style={styles.textoBtnSiguiente}>
            {esUltimo ? 'COMENZAR' : 'SIGUIENTE'}
          </Text>
          <Ionicons
            name={esUltimo ? 'checkmark-circle-outline' : 'arrow-forward-outline'}
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        {!esUltimo ? (
          <TouchableOpacity onPress={finalizar} style={styles.btnOmitir}>
            <Text style={styles.textoBtnOmitir}>Omitir</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ height: 38 }} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000' },
  slide: { width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.62)' },
  overlayColor: { ...StyleSheet.absoluteFillObject },
  contenidoSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 160,
  },
  iconoCirculo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 44,
  },
  titulo: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 16,
  },
  lineaAcento: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  descripcion: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 0,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnSiguiente: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 60,
    borderRadius: 20,
    width: '100%',
    marginBottom: 14,
  },
  textoBtnSiguiente: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  btnOmitir: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textoBtnOmitir: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontWeight: '600',
  },
});
