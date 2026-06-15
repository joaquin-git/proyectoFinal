import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Modal, TextInput, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminProductosViewModel } from '../../viewmodels/AdminProductosViewModel';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminProductos() {
  const { colores, nombreTema, toggleTema } = useTema();
  const { productos, loading, load, saveProduct, deleteProduct } = useAdminProductosViewModel();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

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
    </SafeAreaView>
  );
}

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
