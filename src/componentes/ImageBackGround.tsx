import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';

export default function PantallaConFondo() {
  return (
    <ImageBackground 
      source={require('../../assets/tu_imagen.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)'
  }
});

