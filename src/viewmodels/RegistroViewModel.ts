import { useState } from 'react';
import { RegistroService } from '../services/RegistroService';
import { validarEmail, validarDNI, validarFecha, validarContrasenaFuerte } from '../utils/validaciones';

export const useRegistroViewModel = () => {
  const service = new RegistroService();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validar = (data: any): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!data.nombre) e.nombre = 'El nombre es obligatorio.';
    if (!data.apellidos) e.apellidos = 'Los apellidos son obligatorios.';
    if (!validarFecha(data.fechaNacimiento)) e.fechaNacimiento = 'Formato: dd/mm/aaaa';
    if (!validarDNI(data.dni)) e.dni = 'DNI incorrecto';
    if (!data.telefono) e.telefono = 'El teléfono es obligatorio.';
    if (!validarEmail(data.email)) e.correo = 'Correo electrónico no válido.';
    if (!data.usuario) e.usuario = 'Usuario obligatorio.';
    if (!validarContrasenaFuerte(data.contrasena)) e.contrasena = 'Contraseña débil.';
    if (data.contrasena !== data.confirmarContrasena) e.confirmarContrasena = 'Las contraseñas no coinciden.';
    if (!data.calle) e.calle = 'La calle es obligatoria.';
    if (!data.numeroCasa) e.numeroCasa = 'El número es obligatorio.';
    return e;
  };

  const register = async (data: any): Promise<boolean> => {
    const nuevosErrores = validar(data);
    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return false;

    setLoading(true);
    try {
      await service.register({
        nombre: data.nombre,
        usuario: data.usuario,
        email: data.email,
        contrasena: data.contrasena,
        telefono: data.telefono,
        direccion: {
          calle: data.calle,
          numero: data.numeroCasa,
          pisoLetra: data.pisoLetra || undefined,
        },
      });
      setLoading(false);
      return true;
    } catch (e: any) {
      setLoading(false);
      throw e;
    }
  };

  const limpiarError = (campo: string) =>
    setErrors(prev => ({ ...prev, [campo]: '' }));

  return { loading, errors, register, limpiarError };
};
