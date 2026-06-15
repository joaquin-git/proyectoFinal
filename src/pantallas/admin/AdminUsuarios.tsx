import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar, Modal, Image, ScrollView, Linking } from 'react-native';
import { useTema } from '../../navegacion/NavegacionRaiz';
import { useAdminUsuariosViewModel } from '../../viewmodels/AdminUsuariosViewModel';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Toolbar from '../../componentes/Toolbar';

export default function AdminUsuarios() {
  const { colores, nombreTema, toggleTema } = useTema();
  const { usuarios, loading, load, deleteUser } = useAdminUsuariosViewModel();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const formatearDireccion = (dir: any) => {
    if (!dir) return 'No especificada';
    try {
      const obj = typeof dir === 'string' ? JSON.parse(dir) : dir;
      if (typeof obj === 'object' && obj !== null) {
        return `${obj.calle || ''} ${obj.numero || ''}${obj.pisoLetra ? ', ' + obj.pisoLetra : ''}`.trim() || 'No especificada';
      }
      return String(dir);
    } catch (e) {
      return String(dir);
    }
  };

  const enviarEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(err =>
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo')
    );
  };

  const abrirDetalle = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setModalVisible(true);
  };

  const confirmarEliminar = (usuario: any) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Estás seguro de que quieres eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            const ok = await deleteUser(usuario.id);
            if (ok) Alert.alert('Éxito', 'Usuario eliminado correctamente.');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderUsuario = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colores.fondoSecundario, borderColor: colores.bordeSuave }]}
      onPress={() => abrirDetalle(item)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: colores.primario + '20' }]}>
          {item.foto ? (
            <Image source={{ uri: item.foto }} style={styles.fotoAvatar} />
          ) : (
            <FontAwesome5 name="user" size={20} color={colores.primario} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.nombre, { color: colores.textoPrincipal }]}>{item.nombre}</Text>
          <Text style={[styles.usuario, { color: colores.textoSecundario }]}>@{item.usuario}</Text>
        </View>
        <TouchableOpacity onPress={() => confirmarEliminar(item)} style={styles.botonEliminar}>
          <Ionicons name="trash-outline" size={22} color="#FF5252" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.cardFooter}
        onPress={() => enviarEmail(item.email)}
      >
        <Ionicons name="mail-outline" size={16} color={colores.textoSecundario} />
        <Text style={[styles.email, { color: colores.textoSecundario }]}>{item.email}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.safeToolbar}>
        <Toolbar
          titulo="USUARIOS"
          nombreTema={nombreTema}
          onToggleTema={toggleTema}
          usuario="Admin"
          menuPerfilHabilitado={false}
        />
      </View>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Usuarios</Text>
        <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
          {usuarios.length} usuarios registrados
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colores.primario} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUsuario}
          contentContainerStyle={styles.lista}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={{ color: colores.textoSecundario }}>No hay usuarios registrados</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colores.fondoPrincipal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, { color: colores.textoPrincipal }]}>Detalle del Usuario</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            {usuarioSeleccionado && (
              <ScrollView>
                <View style={styles.detalleHeader}>
                  <View style={[styles.avatarGrande, { borderColor: colores.primario }]}>
                    {usuarioSeleccionado.foto ? (
                      <Image source={{ uri: usuarioSeleccionado.foto }} style={styles.fotoGrande} />
                    ) : (
                      <FontAwesome5 name="user" size={50} color={colores.primario} />
                    )}
                  </View>
                  <Text style={[styles.detalleNombre, { color: colores.textoPrincipal }]}>{usuarioSeleccionado.nombre}</Text>
                  <Text style={[styles.detalleUsuario, { color: colores.textoSecundario }]}>@{usuarioSeleccionado.usuario}</Text>
                </View>

                <View style={styles.infoSeccion}>
                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Correo Electrónico</Text>
                  <Text style={[styles.valor, { color: colores.textoPrincipal }]}>{usuarioSeleccionado.email}</Text>

                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Teléfono</Text>
                  <Text style={[styles.valor, { color: colores.textoPrincipal }]}>{usuarioSeleccionado.telefono || 'No especificado'}</Text>

                  <Text style={[styles.label, { color: colores.textoSecundario }]}>Dirección</Text>
                  <Text style={[styles.valor, { color: colores.textoPrincipal }]}>{formatearDireccion(usuarioSeleccionado.direccion)}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  safeToolbar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: { padding: 20, paddingBottom: 10 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 14, marginTop: 4 },
  lista: { padding: 20, paddingBottom: 100 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fotoAvatar: { width: '100%', height: '100%' },
  info: { flex: 1, marginLeft: 15 },
  nombre: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  usuario: { fontSize: 13, marginTop: 2, opacity: 0.8 },
  botonEliminar: { padding: 8, borderRadius: 10, backgroundColor: 'rgba(255, 82, 82, 0.1)' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  email: { fontSize: 13, marginLeft: 8, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 20, fontWeight: '800' },
  detalleHeader: { alignItems: 'center', marginVertical: 20 },
  avatarGrande: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 15,
  },
  fotoGrande: { width: '100%', height: '100%' },
  detalleNombre: { fontSize: 22, fontWeight: '800' },
  detalleUsuario: { fontSize: 16 },
  infoSeccion: { marginTop: 20 },
  label: { fontSize: 12, fontWeight: '700', marginTop: 15, textTransform: 'uppercase' },
  valor: { fontSize: 16, marginTop: 4 },
  vacio: { alignItems: 'center', marginTop: 50 }
});
