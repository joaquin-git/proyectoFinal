import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Modal, TextInput, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminProductosViewModel } from '../../viewmodels/AdminProductosViewModel';
import { useValoracionesViewModel } from '../../viewmodels/ValoracionesViewModel';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminProductos() {
  const { colores, nombreTema, toggleTema } = useTema();
  const { productos, loading, load, saveProduct, deleteProduct } = useAdminProductosViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [productoValoracion, setProductoValoracion] = useState<any>(null);
  const [modalValoracionesVisible, setModalValoracionesVisible] = useState(false);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    load();
  }, []);

  const abrirModal = (producto?: any) => {
    if (producto) {
      setEditandoId(producto.id);
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion);
      setPrecio(producto.precio.toString());
      setStock(producto.stock.toString());
      setImagen(producto.imagen);
      setCategoria(producto.categoria || '');
    } else {
      setEditandoId(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setStock('');
      setImagen('');
      setCategoria('');
    }
    setModalVisible(true);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !stock) {
      Alert.alert('Error', 'Por favor, rellena los campos obligatorios.');
      return;
    }
    const datos = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      imagen: imagen || 'https://via.placeholder.com/150',
      categoria: categoria || 'Complementos'
    };
    const ok = await saveProduct(editandoId, datos);
    if (ok) {
      Alert.alert('Éxito', editandoId ? 'Producto actualizado.' : 'Producto creado.');
      setModalVisible(false);
    }
  };

  const confirmarEliminar = (id: number) => {
    Alert.alert("Eliminar", "¿Seguro que quieres borrar este producto?", [
      { text: "No" },
      { text: "Sí", style: 'destructive', onPress: () => deleteProduct(id) }
    ]);
  };

  const renderProducto = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave }]}>
      <Image
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
        style={styles.img}
      />
      <View style={styles.info}>
        <Text style={[styles.nombre, { color: colores.textoPrincipal }]}>{item.nombre}</Text>
        <Text style={[styles.precio, { color: colores.primario }]}>{item.precio}€</Text>
        <Text style={[styles.stock, { color: colores.textoSecundario }]}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity onPress={() => { setProductoValoracion(item); setModalValoracionesVisible(true); }} style={styles.botonAccion}>
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
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.safeToolbar}>
        <Toolbar
          titulo="TIENDA"
          nombreTema={nombreTema}
          onToggleTema={toggleTema}
          usuario="Admin"
          menuPerfilHabilitado={false}
        />
      </View>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Productos</Text>
        <TouchableOpacity style={[styles.botonAdd, { backgroundColor: colores.primario }]} onPress={() => abrirModal()}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.textoBotonAdd}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProducto}
        contentContainerStyle={styles.lista}
        refreshing={loading}
        onRefresh={load}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colores.fondoPrincipal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>
                {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colores.textoPrincipal} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={[styles.label, { color: colores.textoSecundario }]}>Nombre</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={nombre} onChangeText={setNombre} />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Descripción</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={descripcion} onChangeText={setDescripcion} multiline />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Precio (€)</Text>
                  <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Stock</Text>
                  <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={stock} onChangeText={setStock} keyboardType="numeric" />
                </View>
              </View>

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Imagen URL</Text>
              <TextInput
                style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]}
                value={imagen}
                onChangeText={setImagen}
                placeholder="https://ejemplo.com/imagen.jpg"
              />

              {imagen ? (
                <View style={styles.previewContainer}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Vista Previa</Text>
                  <Image source={{ uri: imagen }} style={styles.previewImg} />
                </View>
              ) : null}

              <Text style={[styles.label, { color: colores.textoSecundario }]}>Categoría (Tenis, Pádel, Fútbol Sala, Fútbol 7, Ropa, Complementos)</Text>
              <TextInput style={[styles.input, { color: colores.textoPrincipal, backgroundColor: colores.fondoSecundario }]} value={categoria} onChangeText={setCategoria} placeholder="Ej: Tenis" />

              <TouchableOpacity style={[styles.botonGuardar, { backgroundColor: colores.primario }]} onPress={guardarProducto}>
                <Text style={styles.textoGuardar}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ModalValoracionesAdmin
        producto={productoValoracion}
        visible={modalValoracionesVisible}
        onClose={() => setModalValoracionesVisible(false)}
        colores={colores}
      />
    </SafeAreaView>
  );
}

function ModalValoracionesAdmin({ producto, visible, onClose, colores }: any) {
  const vm = useValoracionesViewModel(producto?.id?.toString() ?? '');

  useEffect(() => {
    if (visible && producto?.id) vm.load();
  }, [visible, producto?.id]);

  if (!producto) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={[stylesVal.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
          <View style={stylesVal.header}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[stylesVal.titulo, { color: colores.textoPrincipal }]} numberOfLines={1}>{producto.nombre}</Text>
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
  safeToolbar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 28, fontWeight: '800' },
  botonAdd: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  textoBotonAdd: { color: '#FFF', fontWeight: '700', marginLeft: 5 },
  lista: { padding: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', borderRadius: 20, padding: 12, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  img: { width: 60, height: 60, borderRadius: 12 },
  info: { flex: 1, marginLeft: 15 },
  nombre: { fontSize: 16, fontWeight: '700' },
  precio: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  stock: { fontSize: 12, marginTop: 2 },
  acciones: { flexDirection: 'row' },
  botonAccion: { padding: 8, marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 20, fontWeight: '800' },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 15, textTransform: 'uppercase' },
  input: { borderRadius: 12, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  botonGuardar: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
  textoGuardar: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  previewContainer: { marginTop: 15, alignItems: 'center' },
  previewImg: { width: 150, height: 150, borderRadius: 15, marginTop: 5 }
});
