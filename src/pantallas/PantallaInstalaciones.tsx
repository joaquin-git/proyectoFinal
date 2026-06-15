import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useInstalacionesViewModel } from '../viewmodels/InstalacionesViewModel';
import { getImagenInstalacion, DEFAULT_IMAGE } from '../utils/imagenesInstalaciones';

export interface Instalacion {
  id: string | number;
  nombre: string;
  latitud: number;
  longitud: number;
  direccion: string;
  deportes: string[] | string;
  horario: string;
  puntuacion: string;
  web: string;
  imagen: string;
}

export default function PantallaInstalaciones({ navigation }: any) {
  const { colores } = useTema();
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const {
    instalaciones,
    datosFiltrados,
    busqueda,
    setBusqueda,
    comoLlegar,
    parsearDeportes,
  } = useInstalacionesViewModel();

  const ImageWithFallback = ({ nombre, url, style }: { nombre: string; url?: string; style: any }) => {
    const [error, setError] = useState(false);
    const imageUri = url || getImagenInstalacion(nombre);
    return (
      <Image
        source={{ uri: error ? DEFAULT_IMAGE : imageUri }}
        style={style}
        onError={() => setError(true)}
      />
    );
  };

  const renderTarjeta = ({ item }: { item: Instalacion }) => (
    <View style={[styles.tarjetaLista, { backgroundColor: colores.fondoSecundario }]}>
      <ImageWithFallback nombre={item.nombre} url={item.imagen} style={styles.imagenTarjeta} />
      <View style={styles.infoTarjeta}>
        <View style={styles.filaTitulo}>
          <Text style={[styles.nombreInst, { color: colores.textoPrincipal }]}>{item.nombre}</Text>
          <View style={styles.ratingBadge}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.puntuacionTexto}>{item.puntuacion}</Text>
          </View>
        </View>

        <Text style={[styles.dirInst, { color: colores.textoSecundario }]} numberOfLines={1}>
          <Entypo name="location-pin" size={14} /> {item.direccion}
        </Text>

        <View style={styles.infoFila}>
          <Ionicons name="time-outline" size={14} color={colores.textoSecundario} />
          <Text style={[styles.horarioTexto, { color: colores.textoSecundario }]}>{item.horario}</Text>
        </View>

        <View style={styles.etiquetasDeporte}>
          {parsearDeportes(item.deportes).map((d: string, i: number) => (
            <View key={i} style={[styles.tag, { backgroundColor: colores.primario + '15' }]}>
              <Text style={[styles.tagTexto, { color: colores.primario }]}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contenedorBotones}>
          <TouchableOpacity
            style={[styles.btnAccion, { backgroundColor: colores.primario }]}
            onPress={() => navigation.navigate('ReservaPistas', { centro: item.nombre, instalacionId: item.id })}
          >
            <Text style={styles.txtAccion}>Reservar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecundario, { borderColor: colores.primario }]}
            onPress={() => comoLlegar(item.latitud, item.longitud, item.nombre)}
          >
            <Text style={[styles.txtSecundario, { color: colores.primario }]}>Llegar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.cabeceraFija}>
        <View style={styles.filaSuperior}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
            <Ionicons name="arrow-back" size={28} color={colores.textoPrincipal} />
          </TouchableOpacity>
          <Text style={[styles.saludo, { color: colores.textoPrincipal }]}>Centros Deportivos</Text>
        </View>

        <View style={[styles.buscadorContainer, { backgroundColor: colores.fondoSecundario }]}>
          <Ionicons name="search" size={20} color={colores.textoSecundario} />
          <TextInput
            placeholder="Buscar por nombre o deporte..."
            placeholderTextColor={colores.textoSecundario}
            style={[styles.input, { color: colores.textoPrincipal }]}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <FlatList
        data={datosFiltrados}
        renderItem={renderTarjeta}
        keyExtractor={(item: Instalacion) => item.id.toString()}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.btnFlotante, { backgroundColor: colores.primario }]}
        onPress={() => setMostrarMapa(true)}
      >
        <Ionicons name="map" size={22} color="#FFF" />
        <Text style={styles.txtFlotante}>Ver Mapa</Text>
      </TouchableOpacity>

      <Modal visible={mostrarMapa} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 37.1773, longitude: -3.5986,
              latitudeDelta: 0.1, longitudeDelta: 0.1,
            }}
          >
            {instalaciones
              .filter((inst: Instalacion) => inst.latitud !== 0 && inst.longitud !== 0 && inst.latitud !== null && inst.longitud !== null)
              .map((inst: Instalacion) => (
                <Marker
                  key={inst.id}
                  coordinate={{ latitude: inst.latitud, longitude: inst.longitud }}
                  title={inst.nombre}
                  onCalloutPress={() => {
                    setMostrarMapa(false);
                    navigation.navigate('ReservaPistas', { centro: inst.nombre, instalacionId: inst.id });
                  }}
                />
              ))}
          </MapView>
          <TouchableOpacity style={styles.cerrarMapa} onPress={() => setMostrarMapa(false)}>
            <BlurView intensity={80} style={styles.blurCerrar}>
              <Ionicons name="close" size={28} color="#000" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  cabeceraFija: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15 },
  filaSuperior: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  botonVolver: { padding: 5, marginLeft: -10 },
  saludo: { fontSize: 24, fontWeight: 'bold' },
  buscadorContainer: { height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  listaContent: { padding: 20, paddingBottom: 100 },
  tarjetaLista: { borderRadius: 18, marginBottom: 25, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imagenTarjeta: { width: '100%', height: 160 },
  infoTarjeta: { padding: 15 },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombreInst: { fontSize: 20, fontWeight: '900', flex: 1, marginRight: 10, letterSpacing: -0.5 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  puntuacionTexto: { marginLeft: 4, fontWeight: 'bold', fontSize: 12, color: '#DAA520' },
  dirInst: { fontSize: 14, marginTop: 6 },
  infoFila: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  horarioTexto: { fontSize: 13 },
  etiquetasDeporte: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  tagTexto: { fontSize: 11, fontWeight: 'bold' },
  contenedorBotones: { flexDirection: 'row', marginTop: 20, gap: 10 },
  btnAccion: { flex: 1.5, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  txtAccion: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnSecundario: { flex: 1, height: 45, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  txtSecundario: { fontWeight: 'bold', fontSize: 14 },
  btnFlotante: { position: 'absolute', bottom: 30, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 5 },
  txtFlotante: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cerrarMapa: { position: 'absolute', top: 50, right: 20 },
  blurCerrar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
});
