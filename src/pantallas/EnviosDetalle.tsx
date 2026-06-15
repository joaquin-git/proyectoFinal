import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';

export default function EnviosDetalle({ navigation }: any) {
  const { colores } = useTema();

  const PasoEnvio = ({ icono, titulo, texto }: any) => (
    <View style={styles.paso}>
      <View style={[styles.circuloIcono, { backgroundColor: colores.primario + '15' }]}>
        <Feather name={icono} size={22} color={colores.primario} />
      </View>
      <View style={styles.pasoTexto}>
        <Text style={[styles.pasoTitulo, { color: colores.textoPrincipal }]}>{titulo}</Text>
        <Text style={[styles.pasoDesc, { color: colores.textoSecundario }]}>{texto}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.btnCerrar, { backgroundColor: colores.fondoSecundario }]}
        >
          <Ionicons name="close" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
        <Text style={[styles.tituloHeader, { color: colores.textoPrincipal }]}>Envíos y Entregas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.infoCard, { backgroundColor: colores.fondoSecundario }]}>
          <Feather name="clock" size={40} color={colores.primario} />
          <Text style={[styles.tiempoEstimado, { color: colores.textoPrincipal }]}>24 - 48 Horas</Text>
          <Text style={[styles.tiempoDesc, { color: colores.textoSecundario }]}>Tiempo estimado de entrega en península.</Text>
        </View>

        <Text style={[styles.seccionTitulo, { color: colores.textoPrincipal }]}>¿Cómo funciona?</Text>

        <PasoEnvio
          icono="package"
          titulo="Preparación"
          texto="Tu pedido se prepara cuidadosamente en nuestras instalaciones el mismo día de la compra."
        />
        <PasoEnvio
          icono="truck"
          titulo="Transporte"
          texto="Colaboramos con las mejores agencias para asegurar un transporte rápido y seguro."
        />
        <PasoEnvio
          icono="map-pin"
          titulo="Seguimiento"
          texto="Recibirás un SMS con el número de seguimiento en cuanto el paquete salga del almacén."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 15,
    paddingBottom: 15
  },
  btnCerrar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tituloHeader: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  scroll: { padding: 20 },
  infoCard: { borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 25 },
  tiempoEstimado: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  tiempoDesc: { fontSize: 14, textAlign: 'center', marginTop: 5 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  paso: { flexDirection: 'row', marginBottom: 20 },
  circuloIcono: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  pasoTexto: { flex: 1 },
  pasoTitulo: { fontSize: 16, fontWeight: 'bold' },
  pasoDesc: { fontSize: 14, lineHeight: 20 },
});
