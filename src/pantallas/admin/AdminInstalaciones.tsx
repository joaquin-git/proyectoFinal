import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminInstalacionesViewModel } from '../../viewmodels/AdminInstalacionesViewModel';
import { useValoracionesInstalacionViewModel } from '../../viewmodels/ValoracionesInstalacionViewModel';
import { getImagenInstalacion, DEFAULT_IMAGE } from '../../utils/imagenesInstalaciones';
import { Ionicons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminInstalaciones() {
  const { colores, nombreTema, toggleTema } = useTema();
  const { instalaciones, loading, load, saveInstalacion, deleteInstalacion } = useAdminInstalacionesViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [instalacionValoracion, setInstalacionValoracion] = useState<any>(null);
  const [modalValoracionesVisible, setModalValoracionesVisible] = useState(false);

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [deportes, setDeportes] = useState('');
  const [horario, setHorario] = useState('');
  const [puntuacion, setPuntuacion] = useState('');
  const [web, setWeb] = useState('');
  const [instagram, setInstagram] = useState('');
  const [imagen, setImagen] = useState('');
  const [coordenadas, setCoordenadas] = useState('');

  useEffect(() => {
    load();
  }, []);

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImagen(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const abrirModal = (inst?: any) => {
    if (inst) {
      setEditandoId(inst.id);
      setNombre(inst.nombre);
      setDireccion(inst.direccion);
      setDeportes(inst.deportes.join(', '));
      setHorario(inst.horario);
      setPuntuacion(inst.puntuacion);
      setWeb(inst.web);
      setInstagram(inst.instagram);
      setImagen(inst.imagen || '');
      if (inst.latitud && inst.longitud) {
        setCoordenadas(`${inst.latitud}, ${inst.longitud}`);
      } else {
        setCoordenadas('');
      }
    } else {
      setEditandoId(null);
      setNombre('');
      setDireccion('');
      setDeportes('');
      setHorario('');
      setPuntuacion('');
      setWeb('');
      setInstagram('');
      setImagen('');
      setCoordenadas('');
    }
    setModalVisible(true);
  };

  const guardarInstalacion = async () => {
    if (!nombre || !direccion) {
      Alert.alert('Error', 'Nombre y dirección son obligatorios.');
      return;
    }

    let lat = 0;
    let lng = 0;
    let googleMapsUrl = '';

    if (coordenadas.startsWith('http')) {
      googleMapsUrl = coordenadas;
    } else if (coordenadas.includes(',')) {
      const partes = coordenadas.split(',');
      lat = parseFloat(partes[0].trim()) || 0;
      lng = parseFloat(partes[1].trim()) || 0;
    }

    const datos = {
      nombre,
      direccion,
      deportes: deportes.split(',').map(s => s.trim()).filter(s => s !== ''),
      horario,
      puntuacion,
      web,
      instagram,
      imagen,
      latitud: lat,
      longitud: lng,
      googleMapsUrl
    };

    const ok = await saveInstalacion(editandoId, datos);
    if (ok) {
      Alert.alert('Éxito', editandoId ? 'Instalación actualizada.' : 'Instalación creada.');
      setModalVisible(false);
    }
  };

  const confirmarEliminar = (id: number) => {
    Alert.alert("Eliminar", "¿Borrar esta instalación?", [
      { text: "No" },
      { text: "Sí", style: 'destructive', onPress: () => deleteInstalacion(id) }
    ]);
  };

  const ImageWithFallback = ({ item, style }: { item: any, style: any }) => {
    const [error, setError] = useState(false);
    let customImage = item.imagen;
    if (typeof customImage === 'string') customImage = customImage.trim();
    const hasCustomImage = customImage && customImage !== 'null' && customImage !== '';
    const imageUri = hasCustomImage ? customImage : getImagenInstalacion(item.nombre);

    return (
      <View style={[style, { backgroundColor: '#e1e4e8', overflow: 'hidden' }]}>
        <Image
          source={{ uri: error ? DEFAULT_IMAGE : (imageUri || DEFAULT_IMAGE) }}
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          onError={() => setError(true)}
        />
      </View>
    );
  };

  const renderInst = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave }]}>
      <ImageWithFallback item={item} style={styles.fotoInstalacion} />
      <View style={styles.info}>
        <View style={styles.filaTitulo}>
          <Text style={[styles.nombre, { color: colores.textoPrincipal }]}>{item.nombre}</Text>
          <View style={styles.acciones}>
            <TouchableOpacity onPress={() => { setInstalacionValoracion(item); setModalValoracionesVisible(true); }} style={styles.botonAccion}>
              <Ionicons name="star-outline" size={22} color="#FFD700" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirModal(item)} style={styles.botonAccion}>
              <Ionicons name="create-outline" size={22} color={colores.primario} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmarEliminar(item.id)} style={styles.botonAccion}>
              <Ionicons name="trash-outline" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.dir, { color: colores.textoSecundario }]} numberOfLines={1}>{item.direccion}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.safeToolbar}>
        <Toolbar
          titulo="INSTALACIONES"
          nombreTema={nombreTema}
          onToggleTema={toggleTema}
          usuario="Admin"
          menuPerfilHabilitado={false}
        />
      </View>

      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Instalaciones</Text>
        <TouchableOpacity style={[styles.botonAdd, { backgroundColor: colores.primario }]} onPress={() => abrirModal()}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.textoBotonAdd}>Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={instalaciones}
        keyExtractor={item => item.id.toString()}
        renderItem={renderInst}
        contentContainerStyle={styles.lista}
        refreshing={loading}
        onRefresh={load}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colores.fondoPrincipal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>
                {editandoId ? 'Editar Instalación' : 'Nueva Instalación'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={[styles.label, { color: colores.textoSecundario }]}>Nombre del Centro</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={nombre} onChangeText={setNombre} placeholder="Ej: Padel Club" />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Dirección</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={direccion} onChangeText={setDireccion} multiline />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Deportes (Separados por coma)</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={deportes} onChangeText={setDeportes} placeholder="Pádel, Tenis..." />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Horario</Text>
                  <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={horario} onChangeText={setHorario} placeholder="09:00 - 22:00" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Puntuación</Text>
                  <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={puntuacion} onChangeText={setPuntuacion} placeholder="4.5" />
                </View>
              </View>

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Imagen</Text>

              {imagen ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imagen }} style={styles.previewImg} />
                  <TouchableOpacity style={styles.btnQuitarImagen} onPress={() => setImagen('')}>
                    <Ionicons name="close-circle" size={26} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.placeholderImagen, { backgroundColor: colores.fondoSecundario }]}>
                  <Ionicons name="image-outline" size={36} color={colores.textoSecundario} />
                  <Text style={{ color: colores.textoSecundario, fontSize: 13, marginTop: 6 }}>Sin imagen</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btnGaleria, { borderColor: colores.primario }]}
                onPress={seleccionarImagen}
              >
                <Ionicons name="images-outline" size={20} color={colores.primario} />
                <Text style={[styles.btnGaleriaTexto, { color: colores.primario }]}>Seleccionar de galería</Text>
              </TouchableOpacity>

              <Text style={[styles.labelUrl, { color: colores.textoSecundario }]}>— o pega una URL —</Text>
              <TextInput
                style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]}
                value={(imagen || '').startsWith('data:') ? '' : imagen}
                onChangeText={setImagen}
                placeholder="https://..."
                placeholderTextColor={colores.textoSecundario}
              />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Ubicación GPS (Enlace de Maps o Lat, Lng)</Text>
              <TextInput
                style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]}
                value={coordenadas}
                onChangeText={setCoordenadas}
                placeholder="Pega el enlace de compartir de Google Maps"
              />


              <TouchableOpacity style={[styles.botonGuardar, { backgroundColor: colores.primario }]} onPress={guardarInstalacion}>
                <Text style={styles.textoGuardar}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ModalValoracionesAdminInst
        instalacion={instalacionValoracion}
        visible={modalValoracionesVisible}
        onClose={() => setModalValoracionesVisible(false)}
        colores={colores}
      />
    </SafeAreaView>
  );
}

function ModalValoracionesAdminInst({ instalacion, visible, onClose, colores }: any) {
  const vm = useValoracionesInstalacionViewModel(instalacion?.id?.toString() ?? '');

  useEffect(() => {
    if (visible && instalacion?.id) vm.load();
  }, [visible, instalacion?.id]);

  if (!instalacion) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={[stylesVal.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
          <View style={stylesVal.header}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[stylesVal.titulo, { color: colores.textoPrincipal }]} numberOfLines={1}>{instalacion.nombre}</Text>
              <Text style={[stylesVal.subtitulo, { color: colores.textoSecundario }]}>Valoraciones de usuarios</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={colores.textoPrincipal} />
            </TouchableOpacity>
          </View>

          <View style={stylesVal.mediaFila}>
            <Text style={[stylesVal.mediaNum, { color: colores.primario }]}>{vm.media ?? '—'}</Text>
            <View>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <Ionicons key={n} name={n <= Math.round(parseFloat(vm.media ?? '0')) ? 'star' : 'star-outline'} size={20} color="#FFD700" />
                ))}
              </View>
              <Text style={{ color: colores.textoSecundario, fontSize: 13 }}>
                {vm.valoraciones.length} {vm.valoraciones.length === 1 ? 'valoración' : 'valoraciones'}
              </Text>
            </View>
          </View>

          {vm.loading ? (
            <ActivityIndicator color={colores.primario} style={{ marginTop: 20 }} />
          ) : vm.valoraciones.length === 0 ? (
            <View style={stylesVal.vacio}>
              <Ionicons name="star-outline" size={40} color={colores.textoSecundario} />
              <Text style={[stylesVal.vacioTexto, { color: colores.textoSecundario }]}>Sin valoraciones todavía</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {vm.valoraciones.map((v: any) => (
                <View key={v.id} style={[stylesVal.resena, { backgroundColor: colores.fondoSecundario }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: colores.textoPrincipal, fontWeight: '700', fontSize: 14 }}>{v.usuario_nombre}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1,2,3,4,5].map(n => (
                        <Ionicons key={n} name={n <= v.puntuacion ? 'star' : 'star-outline'} size={13} color="#FFD700" />
                      ))}
                    </View>
                  </View>
                  {v.comentario ? (
                    <Text style={{ color: colores.textoSecundario, fontSize: 13, lineHeight: 18 }}>{v.comentario}</Text>
                  ) : (
                    <Text style={{ color: colores.textoSecundario, fontSize: 12, fontStyle: 'italic' }}>Sin comentario</Text>
                  )}
                  <Text style={{ color: colores.textoSecundario, fontSize: 11, marginTop: 6 }}>{v.fecha}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const stylesVal = StyleSheet.create({
  contenedor: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  titulo: { fontSize: 17, fontWeight: '800' },
  subtitulo: { fontSize: 12, marginTop: 2 },
  mediaFila: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' },
  mediaNum: { fontSize: 42, fontWeight: '900' },
  resena: { borderRadius: 12, padding: 14, marginBottom: 10 },
  vacio: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  vacioTexto: { fontSize: 15, fontWeight: '600' },
});

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  safeToolbar: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 28, fontWeight: '800' },
  botonAdd: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  textoBotonAdd: { color: '#FFF', fontWeight: '700', marginLeft: 5 },
  lista: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 18, marginBottom: 25, overflow: 'hidden', borderWidth: 1, elevation: 3 },
  fotoInstalacion: { width: '100%', height: 160 },
  info: { padding: 15 },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 20, fontWeight: '900', flex: 1, marginRight: 10, letterSpacing: -0.5 },
  dir: { fontSize: 13, marginTop: 6 },
  acciones: { flexDirection: 'row' },
  botonAccion: { padding: 8, marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 20, fontWeight: '800' },
  form: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 5, marginTop: 15, textTransform: 'uppercase' },
  input: { borderRadius: 12, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  botonGuardar: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
  textoGuardar: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  previewContainer: { marginTop: 10, position: 'relative' },
  previewImg: { width: '100%', height: 180, borderRadius: 15 },
  btnQuitarImagen: { position: 'absolute', top: -10, right: -10 },
  placeholderImagen: { height: 120, borderRadius: 15, marginTop: 10, justifyContent: 'center', alignItems: 'center' },
  btnGaleria: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, marginTop: 12, gap: 8 },
  btnGaleriaTexto: { fontWeight: '700', fontSize: 15 },
  labelUrl: { textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 4 }
});
