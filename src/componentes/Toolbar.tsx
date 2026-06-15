import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Modal, 
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { TemaContext } from '../navegacion/NavegacionRaiz';
import { useNavigation } from '@react-navigation/native';

export default function Toolbar({ 
  titulo, 
  nombreTema, 
  onToggleTema, 
  usuario, 
  foto, 
  mostrarPerfil = true, 
  menuPerfilHabilitado = true,
  mostrarMarca = true,
  centrarTitulo = false 
}: any) {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<any>();
  const tema = useContext(TemaContext);

  if (!tema) return null;
  const { colores, setEstaAutenticado } = tema;

  const cerrarSesion = () => {
    setMenuVisible(false);
    setEstaAutenticado(false);
  };

  return (
    <View style={[
      styles.contenedor, 
      { 
        backgroundColor: colores.toolbar,
        borderBottomColor: nombreTema === 'oscuro' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        shadowOpacity: nombreTema === 'oscuro' ? 0 : 0.1,
        elevation: nombreTema === 'oscuro' ? 0 : 3,
      }
    ]}>
      <View style={[styles.izquierda, { flex: centrarTitulo ? 1 : 1.2 }]}> 
        {!centrarTitulo && (
          <Text style={[styles.titulo, { color: colores.toolbarTexto }]} numberOfLines={1} adjustsFontSizeToFit>
            {titulo}
          </Text>
        )}
      </View>

      <View style={[styles.centro, { flex: centrarTitulo ? 4 : 2 }]}> 
        {mostrarMarca ? (
          <Text style={[styles.brandText, { color: colores.primario }]}>Sport<Text style={{ color: colores.toolbarTexto }}>Space</Text></Text>
        ) : (
          centrarTitulo && (
            <Text style={[styles.titulo, { color: colores.toolbarTexto }]} numberOfLines={1} adjustsFontSizeToFit>{titulo}</Text>
          )
        )}
      </View>

      <View style={[styles.derecha, { flex: centrarTitulo ? 1 : 2.2 }]}> 
        {mostrarPerfil && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {usuario && (<Text style={[styles.usuarioLabel, { color: colores.toolbarTexto }]}>{usuario}</Text>)}
            <TouchableOpacity onPress={() => { if (menuPerfilHabilitado) setMenuVisible(true); }} activeOpacity={menuPerfilHabilitado ? 0.7 : 1} style={[styles.botonPerfil, { borderColor: nombreTema === 'oscuro' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', backgroundColor: nombreTema === 'oscuro' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              {foto ? (<Image source={{ uri: foto }} style={styles.foto} />) : (<View style={styles.fotoFallback}><Text style={{fontSize: 12}}>👤</Text></View>)}
            </TouchableOpacity>
          </View>
        )}

        {onToggleTema && (
          <TouchableOpacity onPress={onToggleTema}><Text style={{ color: colores.toolbarTexto, fontSize: 18, marginLeft: 8 }}>{nombreTema === 'oscuro' ? '☀️' : '🌙'}</Text></TouchableOpacity>
        )}
      </View>

      {menuPerfilHabilitado && (
        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.menuDesplegable, { backgroundColor: colores.fondoSecundario }]}> 
                <TouchableOpacity style={styles.opcionMenu} onPress={() => { setMenuVisible(false); navigation.navigate('AjustesPerfil'); }}>
                  <Text style={[styles.textoOpcion, { color: colores.textoPrincipal }]}>⚙️ Ajustes de Perfil</Text>
                </TouchableOpacity>
                <View style={[styles.separador, { backgroundColor: colores.bordeSuave }]} />
                <TouchableOpacity style={styles.opcionMenu} onPress={cerrarSesion}><Text style={[styles.textoOpcion, { color: '#FF4444' }]}>🚪 Cerrar Sesión</Text></TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', zIndex: 10, borderBottomWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  izquierda: { flex: 2, justifyContent: 'center' },
  centro: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  derecha: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  titulo: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.9 },
  brandText: { fontSize: 20, fontWeight: '900', letterSpacing: -0.8, fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-condensed' },
  usuarioLabel: { fontSize: 12, fontWeight: 'bold', marginRight: 8, opacity: 0.7, textTransform: 'lowercase' },
  foto: { width: '100%', height: '100%', borderRadius: 16 },
  botonPerfil: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fotoFallback: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 60 },
  menuDesplegable: { width: 220, borderRadius: 18, padding: 8, elevation: 20 },
  opcionMenu: { paddingVertical: 14, paddingHorizontal: 15 },
  textoOpcion: { fontSize: 16, fontWeight: '700' },
  separador: { height: 1, marginVertical: 4, opacity: 0.5 }
});
