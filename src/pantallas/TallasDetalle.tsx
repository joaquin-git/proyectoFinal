import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';

export default function TallasDetalle({ navigation }: any) {
  const { colores } = useTema();
  const [categoria, setCategoria] = useState('Hombre');

  const SelectorCategoria = () => (
    <View style={[styles.selectorContainer, { backgroundColor: colores.fondoSecundario }]}>
      {['Hombre', 'Mujer', 'Niño'].map((cat) => (
        <TouchableOpacity
          key={cat}
          onPress={() => setCategoria(cat)}
          style={[
            styles.tab,
            categoria === cat && { backgroundColor: colores.primario }
          ]}
        >
          <Text style={[
            styles.tabTexto,
            { color: categoria === cat ? '#FFF' : colores.textoSecundario }
          ]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const TablaTallas = ({ titulo, encabezados, datos }: any) => (
    <View style={styles.seccionTabla}>
      <Text style={[styles.tituloTabla, { color: colores.textoPrincipal }]}>{titulo}</Text>
      <View style={[styles.tabla, { backgroundColor: colores.fondoSecundario }]}>
        <View style={styles.filaHeader}>
          {encabezados.map((h: string) => (
            <Text key={h} style={[styles.celdaHeader, { color: colores.textoPrincipal }]}>{h}</Text>
          ))}
        </View>
        {datos.map((fila: any, index: number) => (
          <View key={index} style={[styles.fila, { borderBottomColor: colores.fondoPrincipal + '50' }]}>
            {fila.map((celda: string, i: number) => (
              <Text key={i} style={[styles.celda, { color: colores.textoSecundario }]}>{celda}</Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderContenido = () => {
    const datosComunes = {
      zapatillas: [['40', '25.5', '7'], ['41', '26.5', '8'], ['42', '27.0', '9'], ['43', '28.0', '10']],
      ropa: [['S', '90-95', '80-85'], ['M', '96-101', '86-91'], ['L', '102-107', '92-97'], ['XL', '108-113', '98-103']],
      calcetines: [['S', '35-38'], ['M', '39-42'], ['L', '43-46']]
    };

    return (
      <View>
        <TablaTallas
          titulo="Zapatillas"
          encabezados={['EU', 'CM', 'USA']}
          datos={categoria === 'Niño' ? [['30', '18.5', '12'], ['32', '20.0', '13']] : datosComunes.zapatillas}
        />
        <TablaTallas
          titulo="Camisetas y Pantalones"
          encabezados={['Talla', 'Pecho (cm)', 'Cintura (cm)']}
          datos={datosComunes.ropa}
        />
        <TablaTallas
          titulo="Calcetines"
          encabezados={['Talla', 'Rango EU']}
          datos={datosComunes.calcetines}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnCerrar}>
          <Ionicons name="close" size={28} color={colores.textoPrincipal} />
        </TouchableOpacity>
        <Text style={[styles.tituloHeader, { color: colores.textoPrincipal }]}>Guía de Tallas</Text>
      </View>

      <SelectorCategoria />

      <ScrollView contentContainerStyle={styles.scroll}>
        {renderContenido()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15
  },
  btnCerrar: { padding: 5 },
  tituloHeader: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  selectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 10
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  tabTexto: { fontWeight: '600', fontSize: 14 },
  scroll: { padding: 20 },
  seccionTabla: { marginBottom: 30 },
  tituloTabla: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 5 },
  tabla: { borderRadius: 16, overflow: 'hidden' },
  filaHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  fila: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  celdaHeader: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  celda: { flex: 1, textAlign: 'center', fontSize: 14 }
});
