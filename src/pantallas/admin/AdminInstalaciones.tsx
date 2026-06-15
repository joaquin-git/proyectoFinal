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
  Image
} from 'react-native';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminInstalacionesViewModel } from '../../viewmodels/AdminInstalacionesViewModel';
import { getImagenInstalacion, DEFAULT_IMAGE } from '../../utils/imagenesInstalaciones';
import { Ionicons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminInstalaciones() {
  const { colores, nombreTema, toggleTema } = useTema();
  const { instalaciones, loading, load, saveInstalacion, deleteInstalacion } = useAdminInstalacionesViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

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

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Imagen URL (Opcional)</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={imagen} onChangeText={setImagen} placeholder="https://..." />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Ubicación GPS (Enlace de Maps o Lat, Lng)</Text>
              <TextInput
                style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]}
                value={coordenadas}
                onChangeText={setCoordenadas}
                placeholder="Pega el enlace de compartir de Google Maps"
              />

              {imagen ? (
                <View style={styles.previewContainer}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Vista Previa</Text>
                  <Image source={{ uri: imagen }} style={styles.previewImg} />
                </View>
              ) : null}

              <TouchableOpacity style={[styles.botonGuardar, { backgroundColor: colores.primario }]} onPress={guardarInstalacion}>
                <Text style={styles.textoGuardar}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  previewContainer: { marginTop: 15, alignItems: 'center' },
  previewImg: { width: 150, height: 100, borderRadius: 15 }
});
