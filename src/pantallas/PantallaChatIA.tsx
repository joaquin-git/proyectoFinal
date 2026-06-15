import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../navegacion/NavegacionRaiz';
import { useChatIAViewModel, Mensaje } from '../viewmodels/ChatIAViewModel';

export default function PantallaChatIA({ navigation }: any) {
  const { colores } = useTema();
  const { mensajes, escribiendo, enviarMensaje } = useChatIAViewModel();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleEnviar = async () => {
    const texto = input;
    setInput('');
    await enviarMensaje(texto);
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => (
    <View style={[
      styles.contenedorMensaje,
      item.esUsuario ? styles.usuarioMensaje : styles.iaMensaje,
      { backgroundColor: item.esUsuario ? colores.primario : colores.fondoSecundario }
    ]}>
      <Text style={[
        styles.textoMensaje,
        { color: item.esUsuario ? '#FFF' : colores.textoPrincipal }
      ]}>
        {item.texto}
      </Text>
      <Text style={[
        styles.hora,
        { color: item.esUsuario ? 'rgba(255,255,255,0.7)' : colores.textoSecundario }
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.fondoPrincipal }]}>
      <View style={[styles.header, { borderBottomColor: colores.fondoSecundario }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.iaBadge, { backgroundColor: colores.primario + '20' }]}>
            <Ionicons name="sparkles" size={16} color={colores.primario} />
          </View>
          <View>
            <Text style={[styles.headerTitulo, { color: colores.textoPrincipal }]}>Asistente SportSpace</Text>
            <Text style={[styles.headerSubtitulo, { color: colores.textoSecundario }]}>En línea • IA</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={mensajes}
          renderItem={renderMensaje}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listaMensajes}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {escribiendo && (
          <View style={[styles.iaMensaje, styles.contenedorMensaje, { backgroundColor: colores.fondoSecundario, marginLeft: 20, flexDirection: 'row', alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={colores.primario} />
            <Text style={[styles.textoMensaje, { color: colores.textoSecundario, marginLeft: 8 }]}>Escribiendo...</Text>
          </View>
        )}

        <View style={[styles.inputContenedor, { backgroundColor: colores.fondoPrincipal, borderTopColor: colores.fondoSecundario }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colores.fondoSecundario, color: colores.textoPrincipal }]}
            placeholder="Escribe tu duda aquí..."
            placeholderTextColor={colores.textoSecundario}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.btnEnviar, { backgroundColor: colores.primario }]}
            onPress={handleEnviar}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    borderBottomWidth: 1,
  },
  btnVolver: { padding: 5, marginRight: 10 },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  iaBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitulo: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitulo: { fontSize: 12 },
  listaMensajes: { padding: 20, paddingBottom: 10 },
  contenedorMensaje: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '80%',
  },
  usuarioMensaje: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  iaMensaje: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  textoMensaje: { fontSize: 15, lineHeight: 20 },
  hora: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContenedor: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  btnEnviar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});
