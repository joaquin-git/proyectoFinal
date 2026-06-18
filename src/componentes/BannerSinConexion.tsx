import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

const ALTURA_BANNER = 44;
const OFFSET_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function BannerSinConexion() {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-(ALTURA_BANNER + OFFSET_TOP))).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false;
      setVisible(offline);
      Animated.spring(translateY, {
        toValue: offline ? 0 : -(ALTURA_BANNER + OFFSET_TOP),
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    });
    return unsubscribe;
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" style={styles.icono} />
      <Text style={styles.texto}>Sin conexión a Internet</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: OFFSET_TOP,
    left: 0,
    right: 0,
    height: ALTURA_BANNER,
    backgroundColor: '#E63946',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icono: { marginRight: 8 },
  texto: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
