import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, SafeAreaView, Platform, StatusBar, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminDashboardViewModel } from '../../viewmodels/AdminDashboardViewModel';

export default function AdminDashboard() {
  const { colores } = useTema();
  const { estadisticas, loading, error, load } = useAdminDashboardViewModel();

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const Tarjeta = ({ icono, titulo, valor, color }: any) => (
    <View style={[styles.tarjeta, { backgroundColor: colores.fondoSecundario }]}>
      <View style={[styles.tarjetaIcono, { backgroundColor: color + '22' }]}>
        <Ionicons name={icono} size={26} color={color} />
      </View>
      <Text style={[styles.tarjetaValor, { color: colores.textoPrincipal }]}>{valor}</Text>
      <Text style={[styles.tarjetaTitulo, { color: colores.textoSecundario }]}>{titulo}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Dashboard</Text>
        <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>Resumen general</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colores.primario} style={{ marginTop: 60 }} />
      ) : error ? (
        <Text style={[styles.errorTexto, { color: colores.textoSecundario }]}>{error}</Text>
      ) : estadisticas ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colores.primario} />}
        >
          <View style={styles.rejillaTarjetas}>
            <Tarjeta icono="people" titulo="Usuarios" valor={estadisticas.totalUsuarios} color="#4A90E2" />
            <Tarjeta icono="calendar" titulo="Reservas" valor={estadisticas.totalReservas} color={colores.primario} />
            <Tarjeta icono="cart" titulo="Compras" valor={estadisticas.totalCompras} color="#FF9800" />
            <Tarjeta icono="cash" titulo="Ingresos" valor={`${parseFloat(estadisticas.ingresosTotales as any).toFixed(2)}€`} color="#9C27B0" />
          </View>

          {estadisticas.reservasPorDeporte.length > 0 && (
            <View style={[styles.seccion, { backgroundColor: colores.fondoSecundario }]}>
              <Text style={[styles.seccionTitulo, { color: colores.textoPrincipal }]}>Reservas por deporte</Text>
              {estadisticas.reservasPorDeporte.map((item, i) => (
                <View key={i} style={styles.fila}>
                  <Text style={[styles.filaTexto, { color: colores.textoPrincipal }]}>{item.deporte}</Text>
                  <View style={styles.filaRight}>
                    <View style={[styles.barrita, { width: Math.min(item.total * 8, 100), backgroundColor: colores.primario }]} />
                    <Text style={[styles.filaNum, { color: colores.textoSecundario }]}>{item.total}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {estadisticas.productosMasVendidos.length > 0 && (
            <View style={[styles.seccion, { backgroundColor: colores.fondoSecundario }]}>
              <Text style={[styles.seccionTitulo, { color: colores.textoPrincipal }]}>Productos más vendidos</Text>
              {estadisticas.productosMasVendidos.map((item, i) => (
                <View key={i} style={styles.fila}>
                  <Text style={[styles.rankNum, { color: colores.primario }]}>{i + 1}</Text>
                  <Text style={[styles.filaTexto, { color: colores.textoPrincipal, flex: 1 }]} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={[styles.filaNum, { color: colores.textoSecundario }]}>{item.vendidos} uds.</Text>
                </View>
              ))}
            </View>
          )}

          {estadisticas.productosStockBajo.length > 0 && (
            <View style={[styles.seccion, { backgroundColor: colores.fondoSecundario }]}>
              <View style={styles.seccionHeaderFila}>
                <Text style={[styles.seccionTitulo, { color: colores.textoPrincipal }]}>Stock bajo</Text>
                <Ionicons name="warning-outline" size={18} color="#FF9800" />
              </View>
              {estadisticas.productosStockBajo.map((item, i) => (
                <View key={i} style={styles.fila}>
                  <Text style={[styles.filaTexto, { color: colores.textoPrincipal, flex: 1 }]} numberOfLines={1}>{item.nombre}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: item.stock === 0 ? '#FF4444' : '#FF9800' }]}>
                    <Text style={styles.stockBadgeTexto}>{item.stock === 0 ? 'Sin stock' : `${item.stock} uds.`}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 15 : 15,
    paddingBottom: 15,
  },
  titulo: { fontSize: 26, fontWeight: '900' },
  subtitulo: { fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  errorTexto: { textAlign: 'center', marginTop: 60 },
  rejillaTarjetas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  tarjeta: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  tarjetaIcono: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  tarjetaValor: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  tarjetaTitulo: { fontSize: 12 },
  seccion: { borderRadius: 16, padding: 16, marginBottom: 16 },
  seccionTitulo: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  seccionHeaderFila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  fila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  filaTexto: { fontSize: 14 },
  filaRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  barrita: { height: 6, borderRadius: 3, minWidth: 4 },
  filaNum: { fontSize: 13, minWidth: 30, textAlign: 'right' },
  rankNum: { fontWeight: '900', fontSize: 16, marginRight: 10, minWidth: 20, textAlign: 'center' },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 'auto' },
  stockBadgeTexto: { color: '#FFF', fontWeight: '700', fontSize: 11 },
});
