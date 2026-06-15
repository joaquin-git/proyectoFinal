import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Espacio } from '../tipos/Espacio';
import { TemaContext } from '../navegacion/NavegacionRaiz';

interface Props {
  espacio: Espacio;
  onPresionar: () => void;
}

export default function TarjetaEspacio({ espacio, onPresionar }: Props) {
  const tema = useContext(TemaContext);
  if (!tema) return null;

  const { colores } = tema;

  return (
    <TouchableOpacity
      style={[styles.tarjeta, { backgroundColor: colores.fondoPrincipal, borderColor: colores.bordeSuave }]}
      onPress={onPresionar}
    >
      <Text style={[styles.nombre, { color: colores.textoPrincipal }]}> {espacio.nombre} </Text>

      <Text style={[styles.detalle, { color: colores.textoSecundario }]}> {espacio.tipo} · {espacio.ubicacion} </Text>

      <Text style={[styles.detalle, { color: colores.textoSecundario }]}> Precio: {espacio.precioHora} €/hora </Text>

      <Text style={[styles.detalle, { color: colores.textoSecundario }]}> Valoración: {espacio.valoracion}/5 </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 14,
  },
});
