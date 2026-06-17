import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';
import { usePagoViewModel } from '../viewmodels/PagoViewModel';
import { programarRecordatorioReserva } from '../utils/notificaciones';

export default function PantallaPago({ route, navigation }: any) {
  const { colores } = useTema();
  const { loading, validar, pagarCarrito, pagarReserva } = usePagoViewModel();

  const { reservaData, productos, total } = route.params || {};
  const esCarrito = !!productos;
  const precioMostrar = esCarrito ? `${total.toFixed(2)}€` : reservaData?.precio;

  const [metodo, setMetodo] = useState<'tarjeta' | 'bizum'>('tarjeta');
  const [tarjeta, setTarjeta] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [cvv, setCvv] = useState('');
  const [telefonoBizum, setTelefonoBizum] = useState('');

  const confirmarPago = async () => {
    const error = validar(metodo, tarjeta, caducidad, cvv, telefonoBizum);
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (esCarrito) {
      await pagarCarrito(productos, total, metodo, () => {
        Alert.alert('¡Compra Realizada!', 'Gracias por tu compra.', [
          {
            text: 'Ver Mis Compras',
            onPress: () => {
              navigation.popToTop();
              navigation.navigate('HistorialCompras');
            },
          },
        ]);
      });
    } else if (reservaData) {
      await pagarReserva(reservaData, async () => {
        const recordatorio = await programarRecordatorioReserva(
          reservaData.deporte,
          reservaData.pista,
          reservaData.fecha,
          reservaData.hora,
        );
        const mensaje = recordatorio
          ? 'Tu pista ha sido reservada con éxito.\n\n🔔 Recibirás un recordatorio 1 hora antes.'
          : 'Tu pista ha sido reservada con éxito.';
        Alert.alert('¡Reserva Confirmada!', mensaje, [
          { text: 'Aceptar', onPress: () => navigation.popToTop() },
        ]);
      });
    }
  };

  return (
    <ImageBackground source={require('../../assets/login.png')} style={styles.fondo}>
      <View style={[styles.overlay, { backgroundColor: colores.fondoPrincipal + 'D9' }]} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.contenedor,
            { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20 }
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver} disabled={loading}>
            <Text style={[styles.textoVolver, { color: colores.textoPrincipal }]}>← Volver</Text>
          </TouchableOpacity>

          <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Finalizar Pago</Text>

          <View style={[styles.tarjetaResumen, { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave, borderWidth: 1 }]}>
            {esCarrito ? (
              <>
                <Text style={[styles.resumenTexto, { color: colores.textoPrincipal }]}>Compra en Tienda</Text>
                <Text style={[styles.resumenFecha, { color: colores.textoSecundario }]}>{productos?.length} artículos en el carrito</Text>
              </>
            ) : (
              <>
                <Text style={[styles.resumenTexto, { color: colores.textoPrincipal }]}>{reservaData?.deporte} - {reservaData?.pista}</Text>
                <Text style={[styles.resumenFecha, { color: colores.textoSecundario }]}>{reservaData?.fecha} a las {reservaData?.hora}</Text>
              </>
            )}
            <Text style={[styles.precio, { color: colores.primario }]}>{precioMostrar}</Text>
          </View>

          <View style={styles.selectorMetodo}>
            <TouchableOpacity
              style={[styles.botonMetodo, { backgroundColor: colores.fondoSecundario }, metodo === 'tarjeta' && { borderColor: colores.primario, borderWidth: 2 }]}
              onPress={() => setMetodo('tarjeta')}
              disabled={loading}
            >
              <Text style={[styles.textoMetodo, { color: colores.textoPrincipal }]}>💳 Tarjeta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonMetodo, { backgroundColor: colores.fondoSecundario }, metodo === 'bizum' && { borderColor: colores.primario, borderWidth: 2 }]}
              onPress={() => setMetodo('bizum')}
              disabled={loading}
            >
              <Text style={[styles.textoMetodo, { color: colores.textoPrincipal }]}>📱 Bizum</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formulario, { backgroundColor: colores.fondoSecundario }]}>
            {metodo === 'tarjeta' ? (
              <>
                <Text style={[styles.label, { color: colores.textoPrincipal }]}>Número de Tarjeta</Text>
                <TextInput placeholder="0000 0000 0000 0000" placeholderTextColor={colores.textoSecundario} style={[styles.input, { color: colores.textoPrincipal, borderColor: colores.bordeSuave }]} keyboardType="numeric" maxLength={16} value={tarjeta} onChangeText={setTarjeta} editable={!loading} />
                <View style={styles.fila}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.label, { color: colores.textoPrincipal }]}>Caducidad</Text>
                    <TextInput placeholder="MM/AA" placeholderTextColor={colores.textoSecundario} style={[styles.input, { color: colores.textoPrincipal, borderColor: colores.bordeSuave }]} value={caducidad} onChangeText={setCaducidad} editable={!loading} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colores.textoPrincipal }]}>CVV</Text>
                    <TextInput placeholder="123" placeholderTextColor={colores.textoSecundario} style={[styles.input, { color: colores.textoPrincipal, borderColor: colores.bordeSuave }]} keyboardType="numeric" maxLength={3} value={cvv} onChangeText={setCvv} editable={!loading} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: colores.textoPrincipal }]}>Número de Teléfono</Text>
                <TextInput placeholder="600 000 000" placeholderTextColor={colores.textoSecundario} style={[styles.input, { color: colores.textoPrincipal, borderColor: colores.bordeSuave }]} keyboardType="phone-pad" maxLength={9} value={telefonoBizum} onChangeText={setTelefonoBizum} editable={!loading} />
                <Text style={[styles.infoBizum, { color: colores.textoSecundario }]}>Recibirás una notificación en tu app bancaria para confirmar el pago.</Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.botonPagar, { backgroundColor: colores.primario }, loading && { opacity: 0.7 }]}
            onPress={confirmarPago}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.textoPagar}>CONFIRMAR Y PAGAR {precioMostrar}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  contenedor: { padding: 25 },
  botonVolver: { marginBottom: 15, alignSelf: 'flex-start' },
  textoVolver: { fontSize: 16, fontWeight: '700' },
  titulo: { fontSize: 28, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  tarjetaResumen: { padding: 20, borderRadius: 15, marginBottom: 25, alignItems: 'center' },
  resumenTexto: { fontSize: 18, fontWeight: '700' },
  resumenFecha: { marginTop: 5 },
  precio: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  selectorMetodo: { flexDirection: 'row', marginBottom: 25 },
  botonMetodo: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 },
  textoMetodo: { fontWeight: '700' },
  formulario: { padding: 20, borderRadius: 15, marginBottom: 30 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: { borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  fila: { flexDirection: 'row' },
  infoBizum: { textAlign: 'center', fontStyle: 'italic', fontSize: 12 },
  botonPagar: { padding: 20, borderRadius: 15, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  textoPagar: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
