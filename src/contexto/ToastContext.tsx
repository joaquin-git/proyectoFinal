import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  mensaje: string;
  tipo: ToastType;
}

interface ToastContextType {
  showToast: (mensaje: string, tipo?: ToastType, duracion?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const COLORES: Record<ToastType, string> = {
  success: '#2ECC71',
  error: '#FF4444',
  info: '#4A90E2',
};

const ICONOS: Record<ToastType, any> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

function ToastComponent({ mensaje, tipo, anim }: { mensaje: string; tipo: ToastType; anim: Animated.Value }) {
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }], backgroundColor: COLORES[tipo] }]}>
      <Ionicons name={ICONOS[tipo]} size={20} color="#FFF" />
      <Text style={styles.texto}>{mensaje}</Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((mensaje: string, tipo: ToastType = 'success', duracion = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    anim.setValue(0);
    setToast({ mensaje, tipo });

    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(duracion - 600),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <ToastComponent mensaje={toast.mensaje} tipo={toast.tipo} anim={anim} />}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  texto: { color: '#FFF', fontWeight: '700', fontSize: 14, flex: 1 },
});
