import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TemaContext } from '../navegacion/NavegacionRaiz';
import Toolbar from '../componentes/Toolbar';
import { useLoginViewModel } from '../viewmodels/LoginViewModel';

export default function PantallaLogin({
  navigation,
  setEstaAutenticado,
}: {
  navigation: any;
  setEstaAutenticado: (v: boolean) => void;
}) {
  const tema = useContext(TemaContext);
  const [verContrasena, setVerContrasena] = useState(false);

  const { email, password, setEmail, setPassword, loading, errors, login } = useLoginViewModel((user) => {
    if (tema?.setUsuarioRol) tema.setUsuarioRol(user.rol || 'user');
    setEstaAutenticado(true);
  });

  if (!tema) return null;
  const { colores } = tema;

  const renderError = (campo: string) =>
    errors[campo] ? (
      <Text style={{ color: '#FF5252', marginBottom: 8, fontWeight: '700' }}>{errors[campo]}</Text>
    ) : null;

  return (
    <ImageBackground
      source={require('../../assets/login.png')}
      style={styles.fondo}
      imageStyle={styles.fondoImagen}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginTop: 150, marginBottom: 20 }}>
              <Toolbar
                titulo="INICIAR SESIÓN"
                mostrarPerfil={false}
                mostrarMarca={false}
                centrarTitulo={true}
              />
            </View>

            <View style={[styles.formulario, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Text style={[styles.label, { color: '#fff' }]}>USUARIO O CORREO</Text>
              <TextInput
                placeholder="Usuario o correo"
                placeholderTextColor="#777"
                style={[styles.input, { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }]}
                value={email}
                onChangeText={setEmail}
              />
              {renderError('email')}

              <Text style={[styles.label, { color: '#fff' }]}>CONTRASEÑA</Text>
              <View style={[styles.inputConIcono, { borderColor: 'rgba(255,255,255,0.3)' }]}>
                <TextInput
                  placeholder="Tu contraseña"
                  placeholderTextColor="#777"
                  secureTextEntry={!verContrasena}
                  style={[styles.inputInterno, { color: '#fff' }]}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setVerContrasena(!verContrasena)}>
                  <Text style={{ fontSize: 10, color: '#AAA', fontWeight: '900' }}>
                    {verContrasena ? 'OCULTAR' : 'MOSTRAR'}
                  </Text>
                </Pressable>
              </View>
              {renderError('password')}

              <TouchableOpacity
                style={[styles.botonEntrar, { backgroundColor: colores.primario }]}
                activeOpacity={0.6}
                onPress={login}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.textoBotonEntrar}>ENTRAR</Text>
                )}
              </TouchableOpacity>

              <Text
                style={{ marginTop: 20, color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 12, letterSpacing: 1 }}
                onPress={() => navigation.navigate('Registro')}
              >
                ¿NO TIENES CUENTA? REGÍSTRATE
              </Text>
              <Text
                style={{ marginTop: 12, color: '#AAA', textAlign: 'center', fontSize: 12, letterSpacing: 0.5 }}
                onPress={() => navigation.navigate('RecuperarContrasena')}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  formulario: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 11,
    marginBottom: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputConIcono: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputInterno: {
    flex: 1,
    marginRight: 10,
    height: '100%',
  },
  fondo: {
    flex: 1,
  },
  fondoImagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  botonEntrar: {
    marginTop: 15,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textoBotonEntrar: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
