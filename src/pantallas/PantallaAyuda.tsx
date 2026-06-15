import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useAyudaViewModel } from '../viewmodels/AyudaViewModel';

export default function PantallaAyuda({ navigation }: any) {
  const { colores } = useTema();
  const vm = useAyudaViewModel();

  useEffect(() => { vm.load(); }, []);

  const SeccionAyuda = ({ icono, titulo, descripcion, onPress }: any) => (
    <TouchableOpacity style={[styles.opcion, { backgroundColor: colores.fondoSecundario }]} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconoContenedor, { backgroundColor: colores.primario + '20' }]}>{icono}</View>
      <View style={styles.textoContenedor}>
        <Text style={[styles.opcionTitulo, { color: colores.textoPrincipal }]}>{titulo}</Text>
        <Text style={[styles.opcionDesc, { color: colores.textoSecundario }]}>{descripcion}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colores.textoSecundario} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
          <Text style={[styles.textoVolver, { color: colores.textoPrincipal }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.tituloPagina, { color: colores.textoPrincipal }]}>Centro de Ayuda</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>¿En qué podemos ayudarte?</Text>
        <SeccionAyuda titulo="Envíos y Entregas" descripcion="Consulta el estado de tu pedido y plazos." icono={<Feather name="truck" size={22} color={colores.primario} />} onPress={() => navigation.navigate('EnviosDetalle')} />
        <SeccionAyuda titulo="Devoluciones" descripcion="Cómo devolver un producto paso a paso." icono={<Ionicons name="refresh-outline" size={22} color={colores.primario} />} onPress={() => navigation.navigate('DevolucionesDetalle')} />
        <SeccionAyuda titulo="Guía de Tallas" descripcion="Encuentra tu ajuste perfecto para ropa y calzado." icono={<MaterialCommunityIcons name="ruler-square" size={22} color={colores.primario} />} onPress={() => navigation.navigate('TallasDetalle')} />

        <View style={[styles.contactoBox, { borderColor: colores.fondoSecundario }]}> 
          <Text style={[styles.contactoTitulo, { color: colores.textoPrincipal }]}>¿Aún tienes dudas?</Text>
          <Text style={[styles.contactoDesc, { color: colores.textoSecundario }]}>Nuestro asistente virtual está disponible 24/7 para ayudarte con tus dudas.</Text>
          <TouchableOpacity style={[styles.botonContacto, { backgroundColor: colores.primario }]} onPress={() => navigation.navigate('ChatIA')}>
            <Text style={styles.botonContactoTexto}>Iniciar Chat con IA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 45 : 10, paddingBottom: 20 },
  botonVolver: { flexDirection: 'row', alignItems: 'center', width: 80 },
  textoVolver: { fontSize: 16, marginLeft: 5 },
  tituloPagina: { fontSize: 20, fontWeight: 'bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  subtitulo: { fontSize: 14, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  opcion: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  iconoContenedor: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textoContenedor: { flex: 1 },
  opcionTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  opcionDesc: { fontSize: 13 },
  contactoBox: { marginTop: 30, padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  contactoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  contactoDesc: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  botonContacto: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
  botonContactoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});

