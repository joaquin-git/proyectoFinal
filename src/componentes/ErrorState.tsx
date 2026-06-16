import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';

interface Props {
  mensaje?: string;
  onReintentar?: () => void;
}

export default function ErrorState({ mensaje = 'No se pudieron cargar los datos', onReintentar }: Props) {
  const { colores } = useTema();

  return (
    <View style={styles.contenedor}>
      <Ionicons name="cloud-offline-outline" size={54} color={colores.textoSecundario} />
      <Text style={[styles.mensaje, { color: colores.textoSecundario }]}>{mensaje}</Text>
      {onReintentar && (
        <TouchableOpacity style={[styles.boton, { backgroundColor: colores.primario }]} onPress={onReintentar}>
          <Ionicons name="refresh" size={16} color="#FFF" />
          <Text style={styles.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  mensaje: { fontSize: 15, textAlign: 'center', marginTop: 16, marginBottom: 24, lineHeight: 22 },
  boton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  botonTexto: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
