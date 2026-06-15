import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';

export default function PantallaMinijuego({ navigation }: { navigation: any }) {
  const { colores } = useTema();

  const getMinijuegoUrl = () => {
    const ipPC = '192.168.1.50';
    let baseUrl = Platform.OS === 'android' ? `http://${ipPC}:3000` : 'http://localhost:3000';
    return `${baseUrl}/minijuego/index.html`;
  };

  return (
    <View style={[styles.principal, { backgroundColor: '#000' }]}>
      <StatusBar hidden />

      <WebView
        source={{ uri: getMinijuegoUrl() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />

      <TouchableOpacity
        style={styles.botonCerrarFlotante}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close-circle" size={40} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  principal: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#000' },
  botonCerrarFlotante: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  }
});
