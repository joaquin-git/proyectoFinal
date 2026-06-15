import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useReservas } from '../contexto/ReservasContext';
import { useTema } from '../navegacion/NavegacionRaiz';
import {
  useReservaDetalleViewModel,
  PRECIOS,
  HORAS_DISPONIBLES,
  esHoraPasadaFn,
  esOcupadaFn
} from '../viewmodels/ReservaDetalleViewModel';

export default function PantallaReservaDetalle({ route, navigation }: any) {
  const { deporte, pista, centro, instalacionId } = route.params;
  const [diaSeleccionado, setDiaSeleccionado] = useState(0);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const { actualizarReserva } = useReservas();
  const { colores } = useTema();
  const { dias, ocupadas, cargarOcupadas } = useReservaDetalleViewModel();

  const precioActual = PRECIOS[deporte] || '0,00 €';

  useEffect(() => {
    cargarOcupadas(instalacionId, diaSeleccionado, deporte);
  }, [diaSeleccionado, instalacionId, deporte]);

  const manejarReserva = () => {
    if (!horaSeleccionada || horaSeleccionada.trim() === '') {
      Alert.alert('Atención', 'Por favor, selecciona un horario antes de continuar.');
      return;
    }
    setCargando(true);

    const datosReserva = {
      deporte,
      pista: centro ? `${pista} - ${centro}` : pista,
      fecha: `${dias[diaSeleccionado].diaCompleto}, ${dias[diaSeleccionado].num} ${dias[diaSeleccionado].mes}`,
      hora: horaSeleccionada,
      precio: precioActual,
      instalacionId
    };

    setTimeout(() => {
      if (route.params?.esEdicion && route.params?.idReserva) {
        actualizarReserva(route.params.idReserva, datosReserva);
        setCargando(false);
        Alert.alert('¡Cambio realizado!', 'Reserva actualizada correctamente.', [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Menu' }],
            })
          }
        ]);
      } else {
        setCargando(false);
        navigation.navigate('Pago', {
          reservaData: { id: Math.random().toString(), ...datosReserva }
        });
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { backgroundColor: colores.toolbar, borderBottomColor: colores.bordeSuave }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.areaVolver}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          disabled={cargando}
        >
          <Text style={[styles.volver, { color: colores.primario }]}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.infoContenedor}>
          <Text style={[styles.tituloHeader, { color: colores.textoPrincipal }]}>{deporte}</Text>
          <Text style={[styles.subHeader, { color: colores.textoSecundario }]}>{pista}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.seccion}>
          <Text style={[styles.tituloSeccion, { color: colores.textoPrincipal }]}>
            Selecciona el día ({dias[diaSeleccionado].diaCompleto}, {dias[diaSeleccionado].num} {dias[diaSeleccionado].mes})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carrusel}>
            {dias.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tarjetaDia,
                  { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave },
                  diaSeleccionado === index && { backgroundColor: '#2ECC71', borderColor: '#2ECC71' }
                ]}
                onPress={() => {
                  setDiaSeleccionado(index);
                  setHoraSeleccionada(null);
                }}
                disabled={cargando}
              >
                <Text style={[styles.textoDia, { color: colores.textoSecundario }, diaSeleccionado === index && styles.textoBlanco]}>
                  {item.dia}
                </Text>
                <Text style={[styles.textoNum, { color: colores.textoPrincipal }, diaSeleccionado === index && styles.textoBlanco]}>
                  {item.num}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.seccion}>
          <Text style={[styles.tituloSeccion, { color: colores.textoPrincipal }]}>Horarios disponibles</Text>
          <View style={styles.gridHoras}>
            {HORAS_DISPONIBLES.map((hora, index) => {
              const pasada = esHoraPasadaFn(hora, dias[diaSeleccionado].esHoy);
              const ocupada = esOcupadaFn(hora, ocupadas, pista, centro, deporte);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.botonHora,
                    { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave },
                    horaSeleccionada === hora && { backgroundColor: colores.primario, borderColor: colores.primario },
                    pasada && { backgroundColor: colores.fondoPrincipal, opacity: 0.3, borderColor: 'transparent' },
                    ocupada && { backgroundColor: '#FF4444', borderColor: '#FF4444', opacity: 0.8 }
                  ]}
                  onPress={() => setHoraSeleccionada(hora)}
                  disabled={cargando || pasada || ocupada}
                >
                  <Text style={[
                    styles.textoHora,
                    { color: colores.textoPrincipal },
                    (horaSeleccionada === hora || ocupada) && styles.textoBlanco,
                    pasada && { color: colores.textoSecundario, textDecorationLine: 'line-through' }
                  ]}>
                    {ocupada ? 'Ocupado' : hora}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colores.toolbar, borderTopColor: colores.bordeSuave }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colores.textoSecundario }]}>Precio Pista</Text>
          <Text style={[styles.precio, { color: '#2ECC71' }]}>{precioActual}</Text>
        </View>
        <TouchableOpacity
          style={[styles.botonConfirmar, (!horaSeleccionada || cargando) && styles.botonDesactivado]}
          onPress={manejarReserva}
          disabled={!horaSeleccionada || cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.textoBoton}>
              {route.params?.esEdicion ? 'Confirmar cambios' : 'Ir a pagar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, paddingTop: Platform.OS === 'ios' ? 10 : 15 },
  areaVolver: { alignSelf: 'flex-start', marginBottom: 8 },
  volver: { fontSize: 16, fontWeight: '600' },
  infoContenedor: { marginTop: 5 },
  tituloHeader: { fontSize: 28, fontWeight: '800' },
  subHeader: { fontSize: 16, marginTop: 2 },
  scrollContent: { paddingBottom: 20 },
  seccion: { padding: 20 },
  tituloSeccion: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  carrusel: { flexDirection: 'row' },
  tarjetaDia: { padding: 15, borderRadius: 16, marginRight: 12, alignItems: 'center', width: 75, borderWidth: 1 },
  textoDia: { fontSize: 13, marginBottom: 4 },
  textoNum: { fontSize: 20, fontWeight: 'bold' },
  textoBlanco: { color: '#FFF' },
  gridHoras: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  botonHora: { width: '30%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  textoHora: { fontWeight: '700', fontSize: 15 },
  footer: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 35 : 25 },
  totalLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  precio: { fontSize: 22, fontWeight: '900' },
  botonConfirmar: { backgroundColor: '#2ECC71', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 14, minWidth: 150, justifyContent: 'center' },
  botonDesactivado: { backgroundColor: '#BDC3C7' },
  textoBoton: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
