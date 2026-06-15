import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';

export default function PantallaInfoApp({ navigation }: any) {
  const { colores, nombreTema } = useTema();

  const SeccionInfo = ({ titulo, contenido, icono }: { titulo: string, contenido: string, icono: string }) => (
    <View style={[styles.tarjeta, { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave }]}>
      <View style={styles.filaTitulo}>
        <Text style={styles.icono}>{icono}</Text>
        <Text style={[styles.tituloSeccion, { color: colores.primario }]}>{titulo}</Text>
      </View>
      <Text style={[styles.textoContenido, { color: colores.textoPrincipal }]}>{contenido}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.principal, { backgroundColor: colores.fondoPrincipal }]}>
      <StatusBar barStyle={nombreTema === 'oscuro' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={[styles.textoVolver, { color: colores.primario }]}>← VOLVER</Text>
        </TouchableOpacity>
        <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Sobre la App</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>

        <SeccionInfo
          icono="🚀"
          titulo="Utilidad de la App"
          contenido="SportSpace es tu centro deportivo digital. Hemos diseñado esta plataforma para que puedas gestionar toda tu vida deportiva desde un solo lugar, sin esperas ni complicaciones."
        />

        <SeccionInfo
          icono="🎾"
          titulo="Reservas de Pistas"
          contenido="Busca tu centro favorito, elige el deporte y reserva en segundos. Gestiona tus partidos de forma cómoda y ten siempre a mano los detalles de tu próxima partida."
        />

        <SeccionInfo
          icono="🛍️"
          titulo="Tienda Oficial"
          contenido="Equípate con lo mejor. En nuestra tienda puedes comprar raquetas, palas, ropa y accesorios. Añade productos al carrito y paga de forma segura con tarjeta o Bizum."
        />

        <SeccionInfo
          icono="🤖"
          titulo="Asistente con IA"
          contenido="¿Tienes dudas sobre las reglas o necesitas consejos de entrenamiento? Nuestro chat inteligente está disponible 24/7 para ayudarte a mejorar tu técnica y resolver tus consultas."
        />

        <SeccionInfo
          icono="👤"
          titulo="Gestión de Perfil"
          contenido="Desde tu perfil puedes ver tus reservas activas, consultar tu historial de compras y personalizar tus datos personales. ¡Incluso puedes subir tu propia foto de perfil!"
        />

        <SeccionInfo
          icono="🎯"
          titulo="Nuestros Objetivos"
          contenido="Promover un estilo de vida activo facilitando el acceso al deporte, optimizar la ocupación de las instalaciones y ofrecerte la mejor experiencia tecnológica deportiva."
        />

        <View style={[styles.tarjetaCreador, { backgroundColor: colores.primario }]}>
          <Text style={styles.labelCreador}>CREADA POR</Text>
          <Text style={styles.nombreCreador}>Joaquín Martínez García</Text>
          <Text style={styles.version}>Versión 1.1.0 • 2026</Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.textoFooter, { color: colores.textoSecundario }]}>
            Desarrollado con React Native, Expo & MySQL
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  principal: { flex: 1 },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    paddingBottom: 15,
  },
  botonVolver: { marginBottom: 5 },
  textoVolver: { fontSize: 14, fontWeight: '900' },
  titulo: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  contenedor: { paddingHorizontal: 20, paddingBottom: 40 },
  tarjeta: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icono: { fontSize: 20, marginRight: 10 },
  tituloSeccion: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  textoContenido: { fontSize: 15, lineHeight: 22, opacity: 0.9 },
  tarjetaCreador: {
    padding: 25,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  labelCreador: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  nombreCreador: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 5 },
  version: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 10 },
  footer: { marginTop: 30, alignItems: 'center' },
  textoFooter: { fontSize: 12, fontWeight: '600' }
});
