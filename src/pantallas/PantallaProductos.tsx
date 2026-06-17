import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput as RNTextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useProductosViewModel } from '../viewmodels/ProductosViewModel';
import { useValoracionesViewModel } from '../viewmodels/ValoracionesViewModel';
import { SkeletonListaProductos } from '../componentes/SkeletonCard';
import ErrorState from '../componentes/ErrorState';
import { useToast } from '../contexto/ToastContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;
const CATEGORIAS = ['Todos', 'Tenis', 'Pádel', 'Fútbol Sala', 'Fútbol 7', 'Ropa', 'Complementos'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1621570277341-3965ff0f55cb?q=80&w=1000';

function ModalValoraciones({ producto, visible, onClose, colores }: any) {
  const vm = useValoracionesViewModel(producto?.id ?? '');
  const { showToast } = useToast();

  useEffect(() => {
    if (visible && producto?.id) vm.load();
  }, [visible, producto?.id]);

  const handleEnviar = async () => {
    if (vm.miPuntuacion === 0) { showToast('Selecciona una puntuación', 'error'); return; }
    const ok = await vm.enviarValoracion();
    if (ok) showToast('¡Valoración enviada!', 'success');
    else showToast('Error al enviar la valoración', 'error');
  };

  if (!producto) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={[estilosVal.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
          <View style={estilosVal.header}>
            <Text style={[estilosVal.titulo, { color: colores.textoPrincipal }]}>{producto.nombre}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={26} color={colores.textoPrincipal} /></TouchableOpacity>
          </View>

          <View style={estilosVal.mediaFila}>
            <Text style={[estilosVal.mediaNum, { color: colores.primario }]}>{vm.media ?? '—'}</Text>
            <View>
              <View style={estilosVal.estrellasFila}>
                {[1,2,3,4,5].map(n => (
                  <Ionicons key={n} name={n <= Math.round(parseFloat(vm.media ?? '0')) ? 'star' : 'star-outline'} size={20} color="#FFD700" />
                ))}
              </View>
              <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>{vm.valoraciones.length} valoraciones</Text>
            </View>
          </View>

          <Text style={[estilosVal.seccion, { color: colores.textoSecundario }]}>TU VALORACIÓN</Text>
          <View style={estilosVal.estrellasFila}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={() => vm.setMiPuntuacion(n)}>
                <Ionicons name={n <= vm.miPuntuacion ? 'star' : 'star-outline'} size={32} color="#FFD700" />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[estilosVal.input, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal }]}
            placeholder="Escribe un comentario (opcional)"
            placeholderTextColor={colores.textoSecundario}
            value={vm.miComentario}
            onChangeText={vm.setMiComentario}
            multiline
            numberOfLines={2}
          />
          <TouchableOpacity style={[estilosVal.boton, { backgroundColor: colores.primario }]} onPress={handleEnviar} disabled={vm.enviando}>
            {vm.enviando ? <ActivityIndicator color="#FFF" /> : <Text style={estilosVal.botonTexto}>Enviar valoración</Text>}
          </TouchableOpacity>

          {vm.valoraciones.length > 0 && (
            <>
              <Text style={[estilosVal.seccion, { color: colores.textoSecundario, marginTop: 20 }]}>RESEÑAS</Text>
              <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                {vm.valoraciones.map((v: any) => (
                  <View key={v.id} style={[estilosVal.resena, { backgroundColor: colores.fondoSecundario }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: colores.textoPrincipal, fontWeight: '700', fontSize: 13 }}>{v.usuario_nombre}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {[1,2,3,4,5].map(n => <Ionicons key={n} name={n <= v.puntuacion ? 'star' : 'star-outline'} size={12} color="#FFD700" />)}
                      </View>
                    </View>
                    {v.comentario ? <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>{v.comentario}</Text> : null}
                    <Text style={{ color: colores.textoSecundario, fontSize: 10, marginTop: 4 }}>{v.fecha}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function PantallaProductos({ navigation }: any) {
  const { colores } = useTema();
  const { showToast } = useToast();

  const {
    productosFiltrados,
    productosVisibles,
    hayMas,
    cargarMas,
    loading, error, load,
    busqueda, setBusqueda,
    categoriaSeleccionada, setCategoriaSeleccionada,
    carrito, totalCarrito,
    agregarAlCarrito, quitarDelCarrito,
    toggleFavorito, isFavorito,
  } = useProductosViewModel();

  const [modalCarritoVisible, setModalCarritoVisible] = useState(false);
  const [modalOpcionesVisible, setModalOpcionesVisible] = useState(false);
  const [modalValoracionesVisible, setModalValoracionesVisible] = useState(false);
  const [productoEnSeleccion, setProductoEnSeleccion] = useState<any>(null);
  const [productoValoracion, setProductoValoracion] = useState<any>(null);
  const [tallaElegida, setTallaElegida] = useState('');
  const [colorElegido, setColorElegido] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const intentarAgregarAlCarrito = (producto: any) => {
    if (producto.tallas || producto.colores) {
      setProductoEnSeleccion(producto);
      setTallaElegida(producto.tallas ? producto.tallas[0] : '');
      setColorElegido(producto.colores ? producto.colores[0] : '');
      setModalOpcionesVisible(true);
    } else {
      agregarAlCarrito(producto);
      showToast(`${producto.nombre} añadido al carrito`, 'success');
    }
  };

  const handleToggleFavorito = async (item: any) => {
    const eraFav = isFavorito(item.id);
    await toggleFavorito(item.id);
    showToast(eraFav ? 'Eliminado de favoritos' : 'Añadido a favoritos', eraFav ? 'info' : 'success');
  };

  const confirmarAgregarAlCarrito = () => {
    agregarAlCarrito(productoEnSeleccion, tallaElegida, colorElegido);
    setModalOpcionesVisible(false);
    showToast(`${productoEnSeleccion.nombre} añadido al carrito`, 'success');
  };

  const renderProducto = ({ item }: { item: any }) => {
    const sinStock = item.stockNum === 0;
    const esFavorito = isFavorito(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colores.fondoSecundario }]}
        onPress={() => { setProductoValoracion(item); setModalValoracionesVisible(true); }}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imagen || DEFAULT_IMAGE }} style={[styles.imagen, sinStock && { opacity: 0.5 }]} />
          {sinStock && (
            <View style={styles.badgeSinStock}>
              <Text style={styles.badgeSinStockTexto}>Sin stock</Text>
            </View>
          )}
          <TouchableOpacity style={styles.btnFavorito} onPress={() => handleToggleFavorito(item)}>
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
              onPress={(e) => { e.stopPropagation?.(); !sinStock && intentarAgregarAlCarrito(item); }}
              disabled={sinStock}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSoloFavoritos(v => !v)}>
              <Ionicons name={soloFavoritos ? 'heart' : 'heart-outline'} size={26} color={soloFavoritos ? '#FF4444' : colores.textoPrincipal} />
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

      {soloFavoritos && (
        <View style={[styles.bannerFavoritos, { backgroundColor: colores.fondoSecundario }]}>
          <Ionicons name="heart" size={14} color="#FF4444" />
          <Text style={[styles.bannerFavoritosTexto, { color: colores.textoPrincipal }]}>Mis favoritos</Text>
          <TouchableOpacity
            style={[styles.btnVolverProductos, { backgroundColor: colores.primario }]}
            onPress={() => setSoloFavoritos(false)}
          >
            <Ionicons name="arrow-back" size={13} color="#FFF" />
            <Text style={styles.btnVolverProductosTexto}>Volver a productos</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <SkeletonListaProductos />
      ) : error ? (
        <ErrorState mensaje={error} onReintentar={load} />
      ) : soloFavoritos && productosFiltrados.filter(p => isFavorito(p.id)).length === 0 ? (
        <View style={styles.favoritosVacio}>
          <Ionicons name="heart-outline" size={60} color={colores.textoSecundario} />
          <Text style={[styles.favoritosVacioTexto, { color: colores.textoSecundario }]}>No tienes favoritos guardados</Text>
          <TouchableOpacity
            style={[styles.btnVolverProductos, { backgroundColor: colores.primario, marginTop: 16 }]}
            onPress={() => setSoloFavoritos(false)}
          >
            <Ionicons name="arrow-back" size={13} color="#FFF" />
            <Text style={styles.btnVolverProductosTexto}>Volver a productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={soloFavoritos ? productosFiltrados.filter(p => isFavorito(p.id)) : productosVisibles}
          renderItem={renderProducto}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.lista}
          columnWrapperStyle={styles.columnas}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={load}
          ListFooterComponent={
            soloFavoritos ? null : hayMas ? (
              <TouchableOpacity
                style={[styles.btnVerMas, { borderColor: colores.primario }]}
                onPress={cargarMas}
              >
                <Text style={[styles.btnVerMasTexto, { color: colores.primario }]}>
                  Ver más productos ({productosFiltrados.length - productosVisibles.length} restantes)
                </Text>
                <Ionicons name="chevron-down" size={18} color={colores.primario} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.footerFin, { color: colores.textoSecundario }]}>
                {productosFiltrados.length} productos en total
              </Text>
            )
          }
        />
      )}

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
      <ModalValoraciones
        producto={productoValoracion}
        visible={modalValoracionesVisible}
        onClose={() => setModalValoracionesVisible(false)}
        colores={colores}
      />
    </SafeAreaView>
  );
}

const estilosVal = StyleSheet.create({
  contenedor: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 10 },
  mediaFila: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },
  mediaNum: { fontSize: 42, fontWeight: '900' },
  estrellasFila: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  seccion: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  input: { borderRadius: 10, padding: 12, marginBottom: 12, minHeight: 60, textAlignVertical: 'top' },
  boton: { padding: 14, borderRadius: 12, alignItems: 'center' },
  botonTexto: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  resena: { borderRadius: 10, padding: 12, marginBottom: 8 },
});

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
  btnVerMas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 15, marginVertical: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  btnVerMasTexto: { fontWeight: '700', fontSize: 14 },
  footerFin: { textAlign: 'center', paddingVertical: 18, fontSize: 13 },
  bannerFavoritos: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 15, borderRadius: 10, marginBottom: 4 },
  bannerFavoritosTexto: { flex: 1, fontSize: 12, fontWeight: '600' },
  btnVolverProductos: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  btnVolverProductosTexto: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  favoritosVacio: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  favoritosVacioTexto: { fontSize: 16, marginTop: 14, fontWeight: '600' },
});
