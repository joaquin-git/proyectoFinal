import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useProductosViewModel } from '../viewmodels/ProductosViewModel';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;
const CATEGORIAS = ['Todos', 'Tenis', 'Pádel', 'Fútbol Sala', 'Fútbol 7', 'Ropa', 'Complementos'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1621570277341-3965ff0f55cb?q=80&w=1000';

export default function PantallaProductos({ navigation }: any) {
  const { colores } = useTema();

  const {
    productosFiltrados,
    busqueda, setBusqueda,
    categoriaSeleccionada, setCategoriaSeleccionada,
    carrito, totalCarrito,
    agregarAlCarrito, quitarDelCarrito,
    toggleFavorito, isFavorito,
  } = useProductosViewModel();

  const [modalCarritoVisible, setModalCarritoVisible] = useState(false);
  const [modalOpcionesVisible, setModalOpcionesVisible] = useState(false);
  const [productoEnSeleccion, setProductoEnSeleccion] = useState<any>(null);
  const [tallaElegida, setTallaElegida] = useState('');
  const [colorElegido, setColorElegido] = useState('');

  const intentarAgregarAlCarrito = (producto: any) => {
    if (producto.tallas || producto.colores) {
      setProductoEnSeleccion(producto);
      setTallaElegida(producto.tallas ? producto.tallas[0] : '');
      setColorElegido(producto.colores ? producto.colores[0] : '');
      setModalOpcionesVisible(true);
    } else {
      agregarAlCarrito(producto);
    }
  };

  const confirmarAgregarAlCarrito = () => {
    agregarAlCarrito(productoEnSeleccion, tallaElegida, colorElegido);
    setModalOpcionesVisible(false);
  };

  const renderProducto = ({ item }: { item: any }) => {
    const sinStock = item.stockNum === 0;
    const esFavorito = isFavorito(item.id);
    return (
      <View style={[styles.card, { backgroundColor: colores.fondoSecundario }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imagen || DEFAULT_IMAGE }} style={[styles.imagen, sinStock && { opacity: 0.5 }]} />
          {sinStock && (
            <View style={styles.badgeSinStock}>
              <Text style={styles.badgeSinStockTexto}>Sin stock</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btnFavorito} onPress={() => toggleFavorito(item.id)}>
            <Ionicons name={esFavorito ? 'heart' : 'heart-outline'} size={20} color={esFavorito ? '#FF4444' : '#FFF'} />
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <Text style={[styles.categoria, { color: colores.primario }]}>{item.categoria.toUpperCase()}</Text>
          <Text style={[styles.nombre, { color: colores.textoPrincipal }]} numberOfLines={2}>{item.nombre}</Text>
          <View style={styles.precioFila}>
            <Text style={[styles.precio, { color: colores.textoPrincipal }]}>{item.precio.toFixed(2)}€</Text>
            <TouchableOpacity
              style={[styles.btnCarrito, { backgroundColor: sinStock ? '#CCC' : colores.primario }]}
              onPress={() => !sinStock && intentarAgregarAlCarrito(item)}
              disabled={sinStock}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.filaSuperiorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.contenedorVolver}>
            <Ionicons name="arrow-back" size={20} color={colores.textoPrincipal} />
            <Text style={[styles.textoVolver, { color: colores.textoPrincipal }]}>Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Tienda Oficial</Text>
          <View style={styles.iconosDerecha}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Ayuda')}>
              <Ionicons name="help-circle-outline" size={26} color={colores.textoPrincipal} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setModalCarritoVisible(true)}>
              <Ionicons name="cart-outline" size={26} color={colores.textoPrincipal} />
              {carrito.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colores.primario }]}>
                  <Text style={styles.badgeTexto}>{carrito.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colores.fondoSecundario }]}>
          <Ionicons name="search" size={20} color={colores.textoSecundario} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor={colores.textoSecundario}
            style={[styles.input, { color: colores.textoPrincipal }]}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <View style={styles.contenedorCategorias}>
        <FlatList
          horizontal
          data={CATEGORIAS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: categoriaSeleccionada === item ? colores.primario : colores.fondoSecundario }]}
              onPress={() => setCategoriaSeleccionada(item)}
            >
              <Text style={[styles.chipTexto, { color: categoriaSeleccionada === item ? '#FFF' : colores.textoPrincipal }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={productosFiltrados}
        renderItem={renderProducto}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.lista}
        columnWrapperStyle={styles.columnas}
        showsVerticalScrollIndicator={false}
      />

      <Modal animationType="fade" transparent visible={modalOpcionesVisible}>
        <View style={styles.overlayModal}>
          <View style={[styles.modalOpciones, { backgroundColor: colores.fondoPrincipal }]}>
            <Text style={[styles.tituloOpciones, { color: colores.textoPrincipal }]}>Personalizar</Text>

            {productoEnSeleccion?.tallas && (
              <View style={styles.seccionOpcion}>
                <Text style={[styles.labelOpcion, { color: colores.textoSecundario }]}>TALLA</Text>
                <View style={styles.filaOpciones}>
                  {productoEnSeleccion.tallas.map((t: string) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTallaElegida(t)}
                      style={[styles.chipTalla, { backgroundColor: tallaElegida === t ? colores.primario : 'transparent', borderColor: colores.primario }]}
                    >
                      <Text style={{ color: tallaElegida === t ? '#FFF' : colores.textoPrincipal }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {productoEnSeleccion?.colores && (
              <View style={styles.seccionOpcion}>
                <Text style={[styles.labelOpcion, { color: colores.textoSecundario }]}>COLOR</Text>
                <View style={styles.filaOpciones}>
                  {productoEnSeleccion.colores.map((c: string) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColorElegido(c)}
                      style={[styles.circuloColor, { backgroundColor: c, borderWidth: colorElegido === c ? 3 : 1, borderColor: colorElegido === c ? colores.primario : '#DDD' }]}
                    />
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btnConfirmar, { backgroundColor: colores.primario }]}
              onPress={confirmarAgregarAlCarrito}
            >
              <Text style={styles.btnConfirmarTexto}>Añadir al carrito</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalOpcionesVisible(false)} style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={{ color: colores.textoSecundario }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={modalCarritoVisible} onRequestClose={() => setModalCarritoVisible(false)}>
        <View style={styles.modalCentrado}>
          <View style={[styles.modalContenido, { backgroundColor: colores.fondoPrincipal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>Tu Carrito</Text>
              <TouchableOpacity onPress={() => setModalCarritoVisible(false)}>
                <Ionicons name="close" size={28} color={colores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            {carrito.length === 0 ? (
              <View style={styles.carritoVacio}>
                <Feather name="shopping-bag" size={50} color={colores.textoSecundario} />
                <Text style={{ color: colores.textoSecundario, marginTop: 10 }}>El carrito está vacío</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={carrito}
                  keyExtractor={item => item.idUnicoCarrito}
                  renderItem={({ item }) => (
                    <View style={styles.itemCarrito}>
                      <Image source={{ uri: item.imagen || DEFAULT_IMAGE }} style={styles.miniImagen} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.nombreItem, { color: colores.textoPrincipal }]}>{item.nombre}</Text>
                        <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>
                          {item.tallaSeleccionada ? `Talla: ${item.tallaSeleccionada} ` : ''}
                          {item.colorSeleccionado ? `• Color seleccionado` : ''}
                        </Text>
                        <Text style={{ color: colores.primario, fontWeight: 'bold' }}>{item.precio.toFixed(2)}€</Text>
                      </View>
                      <TouchableOpacity onPress={() => quitarDelCarrito(item.idUnicoCarrito)}>
                        <Ionicons name="trash-outline" size={22} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <View style={styles.footerCarrito}>
                  <Text style={[styles.totalTexto, { color: colores.textoPrincipal }]}>Total: {totalCarrito.toFixed(2)}€</Text>
                  <TouchableOpacity
                    style={[styles.btnPagar, { backgroundColor: colores.primario }]}
                    onPress={() => {
                      setModalCarritoVisible(false);
                      navigation.navigate('Pago', { productos: carrito, total: totalCarrito });
                    }}
                  >
                    <Text style={styles.btnConfirmarTexto}>Pagar ahora</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10, paddingBottom: 15 },
  filaSuperiorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  contenedorVolver: { flexDirection: 'row', alignItems: 'center', width: 80 },
  textoVolver: { fontSize: 15, marginLeft: 2 },
  titulo: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  iconosDerecha: { flexDirection: 'row', alignItems: 'center', width: 80, justifyContent: 'flex-end' },
  iconBtn: { marginLeft: 12 },
  badge: { position: 'absolute', right: -4, top: -2, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  badgeTexto: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  searchBar: { height: 45, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  input: { flex: 1, marginLeft: 10 },
  contenedorCategorias: { height: 60, marginTop: 10 },
  chip: { paddingHorizontal: 20, height: 40, borderRadius: 20, marginRight: 10, justifyContent: 'center', marginLeft: 15 },
  chipTexto: { fontWeight: '600' },
  lista: { paddingHorizontal: 15, paddingBottom: 30, marginTop: 25 },
  columnas: { justifyContent: 'space-between' },
  card: { width: COLUMN_WIDTH, borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  imageContainer: { width: '100%', height: 140 },
  imagen: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeSinStock: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeSinStockTexto: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  btnFavorito: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 5 },
  info: { padding: 12 },
  categoria: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, opacity: 0.8 },
  nombre: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3, height: 42, marginTop: 4, lineHeight: 20 },
  precioFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  precio: { fontSize: 15, fontWeight: 'bold' },
  btnCarrito: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  overlayModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalOpciones: { borderRadius: 20, padding: 20 },
  tituloOpciones: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  seccionOpcion: { marginBottom: 20 },
  labelOpcion: { fontSize: 11, fontWeight: 'bold', marginBottom: 10 },
  filaOpciones: { flexDirection: 'row', flexWrap: 'wrap' },
  chipTalla: { padding: 8, minWidth: 40, borderRadius: 10, borderWidth: 1, marginRight: 8, marginBottom: 8, alignItems: 'center' },
  circuloColor: { width: 30, height: 30, borderRadius: 15, marginRight: 10, marginBottom: 5 },
  btnConfirmar: { padding: 15, borderRadius: 12, alignItems: 'center' },
  btnConfirmarTexto: { color: '#FFF', fontWeight: 'bold' },
  modalCentrado: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContenido: { height: '75%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold' },
  carritoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCarrito: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 10, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.05)' },
  miniImagen: { width: 60, height: 60, borderRadius: 10 },
  nombreItem: { fontSize: 14, fontWeight: '600' },
  footerCarrito: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20, paddingBottom: 20 },
  totalTexto: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  btnPagar: { padding: 15, borderRadius: 12, alignItems: 'center' },
});
