import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 25;

function SkeletonBox({ width: w, height, style }: { width?: number | string; height: number; style?: any }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: w ?? '100%', height, backgroundColor: '#CCC', borderRadius: 8, opacity: anim },
        style,
      ]}
    />
  );
}

export function SkeletonProductoCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={140} style={{ borderRadius: 0 }} />
      <View style={styles.info}>
        <SkeletonBox height={10} width="50%" style={{ marginBottom: 8 }} />
        <SkeletonBox height={14} width="90%" style={{ marginBottom: 4 }} />
        <SkeletonBox height={14} width="70%" style={{ marginBottom: 14 }} />
        <View style={styles.fila}>
          <SkeletonBox height={16} width={50} />
          <SkeletonBox height={30} width={30} style={{ borderRadius: 8 }} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonInstalacionCard() {
  return (
    <View style={styles.cardInstalacion}>
      <SkeletonBox height={120} style={{ borderRadius: 12, marginBottom: 10 }} />
      <SkeletonBox height={14} width="70%" style={{ marginBottom: 6 }} />
      <SkeletonBox height={11} width="50%" style={{ marginBottom: 6 }} />
      <SkeletonBox height={11} width="40%" />
    </View>
  );
}

export function SkeletonListaProductos() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3, 4, 5].map(i => <SkeletonProductoCard key={i} />)}
    </View>
  );
}

export function SkeletonListaInstalaciones() {
  return (
    <View style={{ paddingHorizontal: 15, marginTop: 20 }}>
      {[0, 1, 2, 3].map(i => <SkeletonInstalacionCard key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: COLUMN_WIDTH, borderRadius: 20, marginBottom: 20, overflow: 'hidden', backgroundColor: '#EEE' },
  info: { padding: 12 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 25 },
  cardInstalacion: { backgroundColor: '#EEE', borderRadius: 16, padding: 12, marginBottom: 14 },
});
