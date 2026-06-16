import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useRecuperarContrasenaViewModel } from '../viewmodels/RecuperarContrasenaViewModel';

export default function RecuperarContrasena({ navigation }: any) {
  const { colores } = useTema();
  const {
    email, setEmail,
    codigo, setCodigo,
    nuevaContrasena, setNuevaContrasena,
    confirmarContrasena, setConfirmarContrasena,
    fase, loading, error,
    enviarCodigo, cambiarContrasena,
  } = useRecuperarContrasenaViewModel();

  const handleEnviar = async () => {
    await enviarCodigo();
  };

  const handleCambiar = async () => {
    const ok = await cambiarContrasena();
    if (ok) {
      Alert.alert('¡Listo!', 'Contraseña actualizada correctamente.', [
        { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.volver} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colores.textoPrincipal} />
            <Text style={[styles.volverTexto, { color: colores.textoPrincipal }]}>Volver</Text>
          </TouchableOpacity>

          <View style={styles.iconoContenedor}>
            <Ionicons name="lock-open-outline" size={60} color={colores.primario} />
          </View>

          <Text style={[styles.titulo, { color: colores.textoPrincipal }]}>Recuperar contraseña</Text>
          <Text style={[styles.subtitulo, { color: colores.textoSecundario }]}>
            {fase === 'email'
              ? 'Introduce tu email y te enviaremos un código de verificación.'
              : `Hemos enviado un código a ${email}. Introdúcelo junto con tu nueva contraseña.`}
          </Text>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTexto}>{error}</Text>
            </View>
          )}

          {fase === 'email' ? (
            <>
              <Text style={[styles.label, { color: colores.textoSecundario }]}>CORREO ELECTRÓNICO</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal, borderColor: colores.bordeSuave }]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colores.textoSecundario}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity
                style={[styles.boton, { backgroundColor: colores.primario }]}
                onPress={handleEnviar}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.botonTexto}>Enviar código</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colores.textoSecundario }]}>CÓDIGO DE VERIFICACIÓN</Text>
              <TextInput
                style={[styles.input, styles.inputCodigo, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal, borderColor: colores.primario }]}
                placeholder="123456"
                placeholderTextColor={colores.textoSecundario}
                keyboardType="number-pad"
                maxLength={6}
                value={codigo}
                onChangeText={setCodigo}
              />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>NUEVA CONTRASEÑA</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal, borderColor: colores.bordeSuave }]}
                placeholder="Nueva contraseña"
                placeholderTextColor={colores.textoSecundario}
                secureTextEntry
                value={nuevaContrasena}
                onChangeText={setNuevaContrasena}
              />

              <Text style={[styles.label, { color: colores.textoSecundario }]}>REPETIR CONTRASEÑA</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal, borderColor: colores.bordeSuave }]}
                placeholder="Repite la contraseña"
                placeholderTextColor={colores.textoSecundario}
                secureTextEntry
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
              />

              <TouchableOpacity
                style={[styles.boton, { backgroundColor: colores.primario }]}
                onPress={handleCambiar}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.botonTexto}>Cambiar contraseña</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  scroll: { padding: 24, paddingTop: 16, flexGrow: 1 },
  volver: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  volverTexto: { marginLeft: 6, fontSize: 15 },
  iconoContenedor: { alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  subtitulo: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  errorBox: { backgroundColor: '#FFE5E5', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorTexto: { color: '#CC0000', fontWeight: '600', textAlign: 'center' },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  inputCodigo: { fontSize: 28, fontWeight: '900', letterSpacing: 12, textAlign: 'center' },
  boton: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
