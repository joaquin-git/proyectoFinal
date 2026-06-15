import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IconoPelota({ deporte }: { deporte: string }) {
  const obtenerEmoji = () => {
    switch (deporte) {
      case 'Fútbol Sala':
      case 'Fútbol 7':
        return '⚽';
      case 'Pádel':
      case 'Tenis':
        return '🎾';
      default:
        return '⚽';
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.emoji}>{obtenerEmoji()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});

