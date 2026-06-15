import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { actualizarUsuario } from '../../servicios/api';

export const useAjustesPerfilViewModel = (onSaved?: () => void) => {
  const [usuario, setUsuario] = useState<any>({
    id: '',
    nombre_persona: '',
    usuario: '',
    correo: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
    foto: '',
    telefono: '',
    calle: '',
    numeroCasa: '',
    pisoLetra: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await AsyncStorage.getItem('usuarioRegistrado');
        if (datos) {
          const d = JSON.parse(datos);
          setUsuario((prev: any) => ({
            ...prev,
            id: d.id,
            nombre_persona: d.nombre || '',
            usuario: d.usuario,
            correo: d.email || d.correo || '',
            foto: d.foto,
            telefono: d.telefono || '',
            calle: d.direccion?.calle || '',
            numeroCasa: d.direccion?.numero || '',
            pisoLetra: d.direccion?.pisoLetra || '',
            passwordBase: d.password || d.contrasena
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    cargarDatos();
  }, []);

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!resultado.canceled) {
      const uriBase64 = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setUsuario((prev: any) => ({ ...prev, foto: uriBase64 }));
      return uriBase64;
    }
    return null;
  };

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const guardarCambios = async (onSuccess?: () => void, onError?: () => void) => {
    if (usuario.correo && !validarEmail(usuario.correo)) {
      onError?.();
      return;
    }

    let passwordFinal = (usuario as any).passwordBase;

    if (usuario.passwordNueva) {
      if (usuario.passwordNueva !== usuario.passwordConfirmar) {
        onError?.();
        return;
      }
      if (usuario.passwordActual !== (usuario as any).passwordBase) {
        onError?.();
        return;
      }
      passwordFinal = usuario.passwordNueva;
    }

    setLoading(true);
    try {
      const datosAGuardar = {
        nombre: usuario.nombre_persona,
        usuario: usuario.usuario,
        correo: usuario.correo,
        email: usuario.correo,
        foto: usuario.foto,
        telefono: usuario.telefono,
        password: passwordFinal,
        contrasena: passwordFinal,
        direccion: {
          calle: usuario.calle,
          numero: usuario.numeroCasa,
          pisoLetra: usuario.pisoLetra
        }
      };

      if (usuario.id) {
        await actualizarUsuario(usuario.id, {
          nombre: usuario.nombre_persona,
          usuario: usuario.usuario,
          email: usuario.correo,
          contrasena: passwordFinal,
          telefono: usuario.telefono,
          direccion: datosAGuardar.direccion,
          foto: usuario.foto
        });
      }

      await AsyncStorage.setItem('usuarioRegistrado', JSON.stringify({ ...datosAGuardar, id: usuario.id }));
      onSuccess?.();
      onSaved?.();
    } catch (e) {
      console.error(e);
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  return {
    usuario,
    setUsuario,
    seleccionarFoto,
    guardarCambios,
    loading
  };
};

