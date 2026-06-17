import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TemaContext } from '../../navegacion/NavegacionRaiz';
import { useReservas } from '../../contexto/ReservasContext';
import { Ionicons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminAjustes() {
  const tema = useContext(TemaContext);
  const { limpiarReservas } = useReservas();

  if (!tema) return null;
  const { colores, setEstaAutenticado, setUsuarioRol, nombreTema, toggleTema } = tema;

  const cerrarSesion = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir del panel de administrador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'usuarioRegistrado']);
            limpiarReservas();
            if (setUsuarioRol) setUsuarioRol(null);
            setEstaAutenticado(false);
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.safeToolbar}>
        <Toolbar
          titulo="AJUSTES"
          nombreTema={nombreTema}
          onToggleTema={toggleTema}
          usuario="Admin"
          menuPerfilHabilitado={false}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { borderColor: colores.primario }]}>
            <Ionicons name="shield-checkmark" size={60} color={colores.primario} />
          </View>
          <Text style={[styles.nombre, { color: colores.textoPrincipal }]}>Administrador</Text>
          <Text style={[styles.rol, { color: colores.textoSecundario }]}>Gestión Total de SportSpace</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={[styles.tituloSeccion, { color: colores.textoSecundario }]}>CUENTA</Text>
          <TouchableOpacity
            style={[styles.botonCerrarSesion, { backgroundColor: '#FF5252' }]}
            onPress={cerrarSesion}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.textoBoton}>Cerrar Sesión Admin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  safeToolbar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scroll: {
    padding: 20,
    paddingBottom: 120,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  nombre: {
    fontSize: 24,
    fontWeight: '800',
  },
  rol: {
    fontSize: 14,
    marginTop: 5,
  },
  seccion: {
    width: '100%',
    marginTop: 20,
  },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 1,
  },
  botonCerrarSesion: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textoBoton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
