import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView
} from 'react-native';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useReservas } from '../contexto/ReservasContext';
import { useAjustesPerfilViewModel } from '../viewmodels/AjustesPerfilViewModel';

export default function AjustesPerfil({ navigation }: any) {
  const { colores, setEstaAutenticado } = useTema();
  const { limpiarReservas } = useReservas();

  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const { usuario, setUsuario, seleccionarFoto, guardarCambios, loading } = useAjustesPerfilViewModel();

  const manejarGuardar = async () => {
    await guardarCambios(
      () => {
        Alert.alert('Éxito', 'Perfil actualizado. Por seguridad, inicia sesión de nuevo.', [
          {
            text: 'OK',
            onPress: () => {
              limpiarReservas();
              setEstaAutenticado(false);
            },
          },
        ]);
      },
      () => Alert.alert('Error', 'Revisa los datos introducidos.')
    );
  };

  return (
    <View style={styles.contenedorRaiz}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../assets/sustitucion.jpg')}
        style={styles.imagenFondo}
        resizeMode="cover"
      >
        <View style={styles.overlayOscuro} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.headerContenedor}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
                <Text style={styles.textoVolver}>VOLVER</Text>
              </TouchableOpacity>
              <Text style={styles.tituloEstilizado}>PERFIL</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.seccionFoto}>
                <TouchableOpacity onPress={seleccionarFoto} activeOpacity={0.8}>
                  <View style={[styles.marcoFoto, { borderColor: '#FFF' }]}>
                    {usuario.foto ? (
                      <Image source={{ uri: usuario.foto }} style={styles.fotoGrande} />
                    ) : (
                      <View style={styles.fotoPlaceholder}>
                        <View style={styles.circuloVacio} />
                      </View>
                    )}
                    <View style={[styles.badgeCamara, { backgroundColor: colores.primario }]}>
                      <View style={styles.puntoCamara} />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.subtituloFoto}>CAMBIAR FOTO DE PERFIL</Text>
              </View>

              <View style={styles.tarjetaSeccion}>
                <Text style={styles.tituloSeccionTarj}>DATOS PERSONALES</Text>
                <View style={styles.grupoInput}>
                  <Text style={styles.label}>NOMBRE COMPLETO</Text>
                  <TextInput style={styles.input} value={usuario.nombre_persona} onChangeText={(t) => setUsuario({ ...usuario, nombre_persona: t })} placeholderTextColor="#777" />
                </View>
                <View style={styles.grupoInput}>
                  <Text style={styles.label}>NOMBRE DE USUARIO</Text>
                  <TextInput style={styles.input} value={usuario.usuario} onChangeText={(t) => setUsuario({ ...usuario, usuario: t })} placeholderTextColor="#777" />
                </View>
                <View style={styles.grupoInput}>
                  <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                  <TextInput style={styles.input} value={usuario.correo} onChangeText={(t) => setUsuario({ ...usuario, correo: t })} placeholder="ejemplo@correo.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#777" />
                </View>
                <View style={styles.grupoInput}>
                  <Text style={styles.label}>TELÉFONO</Text>
                  <TextInput style={styles.input} value={usuario.telefono} onChangeText={(t) => setUsuario({ ...usuario, telefono: t })} placeholder="Ej: 600123456" keyboardType="phone-pad" placeholderTextColor="#777" />
                </View>
              </View>

              <View style={styles.tarjetaSeccion}>
                <Text style={styles.tituloSeccionTarj}>DIRECCIÓN</Text>
                <View style={styles.grupoInput}>
                  <Text style={styles.label}>CALLE</Text>
                  <TextInput style={styles.input} value={usuario.calle} onChangeText={(t) => setUsuario({ ...usuario, calle: t })} placeholder="Nombre de la calle" placeholderTextColor="#777" />
                </View>
                <View style={styles.filaInputs}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.label}>Nº / PORTAL</Text>
                    <TextInput style={styles.input} value={usuario.numeroCasa} onChangeText={(t) => setUsuario({ ...usuario, numeroCasa: t })} placeholder="Ej: 12" placeholderTextColor="#777" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>PISO / LETRA</Text>
                    <TextInput style={styles.input} value={usuario.pisoLetra} onChangeText={(t) => setUsuario({ ...usuario, pisoLetra: t })} placeholder="Ej: 3º B" placeholderTextColor="#777" />
                  </View>
                </View>
              </View>

              <View style={styles.tarjetaSeccion}>
                <Text style={styles.tituloSeccionTarj}>SEGURIDAD</Text>
                <View style={styles.grupoInput}>
                  <View style={styles.filaLabel}>
                    <Text style={styles.label}>CONTRASEÑA ACTUAL</Text>
                    <TouchableOpacity onPress={() => setVerActual(!verActual)}>
                      <Text style={styles.textoToggle}>{verActual ? 'OCULTAR' : 'MOSTRAR'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput style={styles.input} value={usuario.passwordActual} onChangeText={(t) => setUsuario({ ...usuario, passwordActual: t })} secureTextEntry={!verActual} placeholderTextColor="#555" />
                </View>
                <View style={styles.grupoInput}>
                  <View style={styles.filaLabel}>
                    <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
                    <TouchableOpacity onPress={() => setVerNueva(!verNueva)}>
                      <Text style={styles.textoToggle}>{verNueva ? 'OCULTAR' : 'MOSTRAR'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput style={styles.input} value={usuario.passwordNueva} onChangeText={(t) => setUsuario({ ...usuario, passwordNueva: t })} secureTextEntry={!verNueva} placeholderTextColor="#555" />
                </View>
                <View style={styles.grupoInput}>
                  <View style={styles.filaLabel}>
                    <Text style={styles.label}>CONFIRMAR NUEVA</Text>
                    <TouchableOpacity onPress={() => setVerConfirmar(!verConfirmar)}>
                      <Text style={styles.textoToggle}>{verConfirmar ? 'OCULTAR' : 'MOSTRAR'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput style={styles.input} value={usuario.passwordConfirmar} onChangeText={(t) => setUsuario({ ...usuario, passwordConfirmar: t })} secureTextEntry={!verConfirmar} placeholderTextColor="#555" />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.botonGuardar, { backgroundColor: colores.primario }, loading && { opacity: 0.7 }]}
                onPress={manejarGuardar}
                disabled={loading}
              >
                <Text style={styles.textoBotonGuardar}>{loading ? 'GUARDANDO...' : 'APLICAR CAMBIOS'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorRaiz: { flex: 1, backgroundColor: '#000' },
  imagenFondo: { flex: 1 },
  overlayOscuro: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  headerContenedor: { paddingTop: Platform.OS === 'android' ? 50 : 10, paddingHorizontal: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  botonVolver: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  textoVolver: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  tituloEstilizado: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  seccionFoto: { alignItems: 'center', marginVertical: 25 },
  marcoFoto: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  fotoGrande: { width: '100%', height: '100%', borderRadius: 60 },
  fotoPlaceholder: { width: '100%', height: '100%', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  circuloVacio: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#444' },
  badgeCamara: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  puntoCamara: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF' },
  subtituloFoto: { fontSize: 11, color: '#FFF', fontWeight: '800', marginTop: 12, letterSpacing: 1 },
  tarjetaSeccion: { backgroundColor: 'rgba(30,30,30,0.95)', borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tituloSeccionTarj: { fontSize: 16, fontWeight: '900', marginBottom: 22, letterSpacing: 1, color: '#FFF' },
  grupoInput: { marginBottom: 20 },
  filaInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  filaLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, color: '#FFF' },
  textoToggle: { fontSize: 10, fontWeight: '900', color: '#AAA' },
  input: { height: 55, borderRadius: 14, paddingHorizontal: 18, fontSize: 16, color: '#FFF', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  botonGuardar: { height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  textoBotonGuardar: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
