import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView, StatusBar, Modal, Platform, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useMisComprasViewModel } from '../viewmodels/MisComprasViewModel';

export default function MisCompras({ navigation }: any) {
  const { colores } = useTema();
  const { compras, procesarDevolucion } = useMisComprasViewModel();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [seleccionada, setSeleccionada] = useState<any>(null);

  const gestionarDevolucion = (compra: any) => {
    setSeleccionada(compra);
    setModalVisible(true);
  };

  const verDetalles = (compra: any) => {
    setSeleccionada(compra);
    setModalDetalleVisible(true);
  };

  const confirmarDevolucion = async () => {
    if (seleccionada) {
      setModalVisible(false);
      await procesarDevolucion(seleccionada);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colores.fondoSecundario }]}
      onPress={() => verDetalles(item)}
      activeOpacity={0.8}
    >
      <View style={styles.filaSuperior}>
        <Image source={{ uri: item.imagen }} style={styles.imagenMini} />
        <View style={styles.infoTexto}>
          <Text style={[styles.idPedido, { color: colores.textoSecundario }]}>{item.id}</Text>
          <Text style={[styles.fecha, { color: colores.textoPrincipal }]}>{item.fecha}</Text>
          <Text style={[styles.productos, { color: colores.textoSecundario }]} numberOfLines={1}>
            {item.productos.map((p: any) => typeof p === 'string' ? p : p.nombre).join(' + ')}
          </Text>
        </View>
        <View style={styles.precioContenedor}>
          <Text style={[styles.precio, { color: colores.primario }]}>{item.total.toFixed(2)}€</Text>
        </View>
      </View>
      <View style={styles.divisor} />
      <View style={styles.filaAcciones}>
        <View style={[styles.badge, { backgroundColor: item.estado === 'Devuelto' ? '#FF4444' : '#4CAF50' }]}>
          <Text style={styles.badgeTexto}>{item.estado}</Text>
        </View>
        <TouchableOpacity style={styles.botonDetalle} onPress={() => verDetalles(item)}>
          <Text style={[styles.textoDetalle, { color: colores.textoSecundario }]}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={14} color={colores.textoSecundario} />
        </TouchableOpacity>
        {item.estado === 'Entregado' && (
          <TouchableOpacity style={styles.botonDevolver} onPress={() => gestionarDevolucion(item)}>
            <Feather name="refresh-ccw" size={14} color={colores.primario} />
            <Text style={[styles.textoDevolver, { color: colores.primario }]}>Devolver</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.filaSuperiorHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.contenedorVolver}>
            <Ionicons name="arrow-back" size={20} color={colores.textoPrincipal} />
            <Text style={[styles.textoVolver, { color: colores.textoPrincipal }]}>Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Historial</Text>
          <View style={{ width: 80 }} />
        </View>
      </View>

      <FlatList
        data={compras}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Feather name="shopping-bag" size={60} color={colores.textoSecundario} />
            <Text style={{ color: colores.textoSecundario, marginTop: 15 }}>No hay compras aún</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colores.fondoSecundario }]}>
            <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>¿Devolver pedido?</Text>
            <Text style={[styles.modalSubtitulo, { color: colores.textoSecundario }]}>Importe: {seleccionada?.total.toFixed(2)}€</Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colores.textoSecundario }}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnConfirmar, { backgroundColor: colores.primario }]} onPress={confirmarDevolucion}>
                <Text style={styles.textoConfirmar}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalleVisible} transparent animationType="slide">
        <View style={styles.overlayDetalle}>
          <View style={[styles.modalDetalle, { backgroundColor: colores.fondoPrincipal }]}>
            <View style={styles.modalHeaderDetalle}>
              <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>Detalle del Pedido</Text>
              <TouchableOpacity onPress={() => setModalDetalleVisible(false)}>
                <Ionicons name="close-circle" size={30} color={colores.textoSecundario} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.infoOrden, { backgroundColor: colores.fondoSecundario }]}>
                <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>Nº DE PEDIDO</Text>
                <Text style={{ color: colores.textoPrincipal, fontWeight: 'bold', fontSize: 16 }}>{seleccionada?.id}</Text>
                <View style={{ height: 10 }} />
                <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>FECHA</Text>
                <Text style={{ color: colores.textoPrincipal }}>{seleccionada?.fecha}</Text>
                <View style={{ height: 10 }} />
                <Text style={{ color: colores.textoSecundario, fontSize: 12 }}>MÉTODO DE PAGO</Text>
                <Text style={{ color: colores.textoPrincipal, textTransform: 'capitalize' }}>{seleccionada?.metodoPago || 'Tarjeta'}</Text>
              </View>

              <Text style={[styles.seccionTitulo, { color: colores.textoPrincipal }]}>Productos</Text>
              {seleccionada?.productos.map((prod: any, idx: number) => {
                const esObjeto = typeof prod !== 'string';
                const nombre = esObjeto ? prod.nombre : prod;
                return (
                  <View key={idx} style={[styles.itemDetalle, { borderBottomColor: colores.bordeSuave }]}>
                    <Image source={{ uri: esObjeto ? prod.imagen : seleccionada.imagen }} style={styles.imgDetalle} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={[styles.nombreProdDetalle, { color: colores.textoPrincipal }]}>{nombre}</Text>
                      {esObjeto && (
                        <Text style={{ color: colores.textoSecundario, fontSize: 13 }}>
                          {prod.tallaSeleccionada ? `Talla: ${prod.tallaSeleccionada} ` : ''}
                          {prod.colorSeleccionado ? `• Color seleccionado` : ''}
                        </Text>
                      )}
                      <Text style={{ color: colores.primario, fontWeight: 'bold', marginTop: 5 }}>
                        {esObjeto ? `${prod.precio.toFixed(2)}€` : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <View style={styles.totalDetalle}>
                <Text style={[styles.totalLabel, { color: colores.textoSecundario }]}>TOTAL PAGADO</Text>
                <Text style={[styles.totalMonto, { color: colores.primario }]}>{seleccionada?.total.toFixed(2)}€</Text>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 45 : 10, paddingBottom: 15 },
  filaSuperiorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contenedorVolver: { flexDirection: 'row', alignItems: 'center', width: 80 },
  textoVolver: { fontSize: 15, marginLeft: 2 },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  lista: { padding: 20 },
  card: { borderRadius: 20, padding: 15, marginBottom: 15, elevation: 4 },
  filaSuperior: { flexDirection: 'row', alignItems: 'center' },
  imagenMini: { width: 60, height: 60, borderRadius: 12 },
  infoTexto: { flex: 1, marginLeft: 15 },
  idPedido: { fontSize: 10, fontWeight: 'bold' },
  fecha: { fontSize: 14, fontWeight: '700', marginVertical: 2 },
  productos: { fontSize: 12 },
  precioContenedor: { alignItems: 'flex-end' },
  precio: { fontSize: 16, fontWeight: '900' },
  divisor: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 12 },
  filaAcciones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  botonDevolver: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textoDevolver: { fontSize: 13, fontWeight: '600' },
  vacio: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 30 },
  modal: { borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalSubtitulo: { textAlign: 'center', marginBottom: 20 },
  modalBotones: { flexDirection: 'row', gap: 15 },
  btnCancelar: { flex: 1, padding: 15, alignItems: 'center' },
  btnConfirmar: { flex: 2, padding: 15, borderRadius: 15, alignItems: 'center' },
  textoConfirmar: { color: '#FFF', fontWeight: 'bold' },
  overlayDetalle: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalDetalle: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '90%' },
  modalHeaderDetalle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  infoOrden: { padding: 20, borderRadius: 20, marginBottom: 25 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  itemDetalle: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  imgDetalle: { width: 70, height: 70, borderRadius: 15 },
  nombreProdDetalle: { fontSize: 16, fontWeight: '600' },
  totalDetalle: { marginTop: 30, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
  totalLabel: { fontSize: 12, letterSpacing: 1, marginBottom: 5 },
  totalMonto: { fontSize: 28, fontWeight: '900' },
  botonDetalle: { flexDirection: 'row', alignItems: 'center' },
  textoDetalle: { fontSize: 12, marginRight: 4 },
});
