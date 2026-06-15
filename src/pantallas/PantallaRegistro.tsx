import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TemaContext } from '../navegacion/NavegacionRaiz';
import Toolbar from '../componentes/Toolbar';
import * as ImagePicker from 'expo-image-picker';
import { useRegistroViewModel } from '../viewmodels/RegistroViewModel';

export default function PantallaRegistro({ navigation }: any) {
  const tema = useContext(TemaContext);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [calle, setCalle] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [pisoLetra, setPisoLetra] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<any>(null);

  const { loading, errors, register, limpiarError } = useRegistroViewModel();

  if (!tema) return null;
  const { colores } = tema;

  const manejarRegistro = async () => {
    try {
      const ok = await register({
        nombre, apellidos, fechaNacimiento, dni, telefono,
        email, usuario, contrasena, confirmarContrasena,
        calle, numeroCasa, pisoLetra,
      });
      if (ok) {
        Alert.alert(
          '¡Bienvenido!',
          'Cuenta creada correctamente.',
          [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al intentar conectar con la base de datos.');
    }
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImagenSeleccionada(result.assets[0]);
  };

  const renderError = (campo: string) =>
    errors[campo] ? (
      <Text style={styles.textoError}>{errors[campo]}</Text>
    ) : null;

  return (
    <ImageBackground
      source={require('../../assets/login.png')}
      style={styles.contenedorPrincipal}
      imageStyle={styles.fondoImagen}
    >
      <View style={styles.overlayTinteGlobal} />

      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.contenedorToolbar}>
            <Toolbar
              titulo="Registro"
              mostrarPerfil={false}
              mostrarMarca={false}
              centrarTitulo={true}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formulario}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                placeholder="Introduce tu nombre"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={nombre}
                onChangeText={(t) => { setNombre(t); limpiarError('nombre'); }}
              />
              {renderError('nombre')}

              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                placeholder="Introduce tus apellidos"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={apellidos}
                onChangeText={(t) => { setApellidos(t); limpiarError('apellidos'); }}
              />
              {renderError('apellidos')}

              <View style={styles.filaInputs}>
                <View style={{ flex: 2, marginRight: 10 }}>
                  <Text style={styles.label}>Calle</Text>
                  <TextInput
                    placeholder="Nombre de la calle"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    style={styles.input}
                    value={calle}
                    onChangeText={(t) => { setCalle(t); limpiarError('calle'); }}
                  />
                  {renderError('calle')}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nº / Portal</Text>
                  <TextInput
                    placeholder="Ej: 12"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    style={styles.input}
                    value={numeroCasa}
                    onChangeText={(t) => { setNumeroCasa(t); limpiarError('numeroCasa'); }}
                  />
                  {renderError('numeroCasa')}
                </View>
              </View>

              <Text style={styles.label}>Piso y Letra (Opcional)</Text>
              <TextInput
                placeholder="Ej: 3º B (Dejar vacío si es casa)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={pisoLetra}
                onChangeText={setPisoLetra}
              />

              <Text style={styles.label}>Fecha de nacimiento</Text>
              <View style={styles.inputConIcono}>
                <TextInput
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.inputInterno}
                  value={fechaNacimiento}
                  onChangeText={(t) => { setFechaNacimiento(t); limpiarError('fechaNacimiento'); }}
                />
                <Pressable onPress={() => setMostrarCalendario(true)}>
                  <Text style={styles.iconoEmoji}>📅</Text>
                </Pressable>
              </View>
              {mostrarCalendario && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setMostrarCalendario(false);
                    if (selectedDate) {
                      const dia = selectedDate.getDate().toString().padStart(2, '0');
                      const mes = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                      const año = selectedDate.getFullYear();
                      setFechaNacimiento(`${dia}/${mes}/${año}`);
                    }
                  }}
                />
              )}
              {renderError('fechaNacimiento')}

              <Text style={styles.label}>DNI</Text>
              <TextInput
                placeholder="12345678Z"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={dni}
                onChangeText={(t) => { setDni(t); limpiarError('dni'); }}
              />
              {renderError('dni')}

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                placeholder="Ej: 600123456"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={(t) => { setTelefono(t); limpiarError('telefono'); }}
              />
              {renderError('telefono')}

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                placeholder="usuario@dominio.com"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); limpiarError('correo'); }}
              />
              {renderError('correo')}

              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                placeholder="Elige un nombre de usuario"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.input}
                value={usuario}
                onChangeText={(t) => { setUsuario(t); limpiarError('usuario'); }}
              />
              {renderError('usuario')}

              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputConIcono}>
                <TextInput
                  placeholder="Crea una contraseña segura"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry={!verContrasena}
                  style={styles.inputInterno}
                  value={contrasena}
                  onChangeText={(t) => { setContrasena(t); limpiarError('contrasena'); }}
                />
                <Pressable onPress={() => setVerContrasena(!verContrasena)}>
                  <Text style={styles.textoToggleContrasena}>
                    {verContrasena ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </Pressable>
              </View>
              {renderError('contrasena')}

              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputConIcono}>
                <TextInput
                  placeholder="Repite la contraseña"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry={!verConfirmar}
                  style={styles.inputInterno}
                  value={confirmarContrasena}
                  onChangeText={(t) => { setConfirmarContrasena(t); limpiarError('confirmarContrasena'); }}
                />
                <Pressable onPress={() => setVerConfirmar(!verConfirmar)}>
                  <Text style={styles.textoToggleContrasena}>
                    {verConfirmar ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </Pressable>
              </View>
              {renderError('confirmarContrasena')}

              <Text style={[styles.label, { marginTop: 10 }]}>Foto de perfil</Text>
              <TouchableOpacity onPress={seleccionarImagen} style={styles.botonFoto}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {imagenSeleccionada ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </Text>
              </TouchableOpacity>

              {imagenSeleccionada && (
                <Image
                  source={{ uri: imagenSeleccionada.uri }}
                  style={styles.previewFoto}
                />
              )}

              <TouchableOpacity
                style={[styles.botonRegistro, { backgroundColor: colores.primario }, loading && { opacity: 0.7 }]}
                onPress={manejarRegistro}
                disabled={loading}
              >
                <Text style={styles.textoBotonRegistro}>
                  {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.enlaceLogin}>
                  ¿Ya tienes cuenta? <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1 },
  fondoImagen: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlayTinteGlobal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  contenedorToolbar: { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, zIndex: 10, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  formulario: { padding: 22, borderRadius: 24, backgroundColor: 'rgba(20, 20, 20, 0.85)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  label: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 },
  input: { height: 52, borderWidth: 1.5, borderRadius: 14, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.03)', paddingHorizontal: 16, color: '#FFFFFF', marginBottom: 6 },
  inputConIcono: { height: 52, borderWidth: 1.5, borderRadius: 14, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.03)', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  inputInterno: { flex: 1, color: '#FFFFFF', height: '100%', fontSize: 15 },
  filaInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  iconoEmoji: { fontSize: 18, color: '#FFFFFF', opacity: 0.8 },
  textoToggleContrasena: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, marginLeft: 10 },
  textoError: { color: '#FF6B6B', fontSize: 12, marginBottom: 12, fontWeight: '500', marginLeft: 4 },
  botonFoto: { backgroundColor: 'rgba(255, 255, 255, 0.1)', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.3)', marginBottom: 15 },
  previewFoto: { width: 90, height: 90, borderRadius: 45, alignSelf: 'center', marginBottom: 20, borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.2)' },
  botonRegistro: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  textoBotonRegistro: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.2 },
  enlaceLogin: { marginTop: 22, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', fontSize: 14 },
});
