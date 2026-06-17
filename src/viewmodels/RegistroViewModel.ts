import { useState } from 'react';
import { RegistroService } from '../services/RegistroService';

const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validarDNI = (dni: string) => {
  const regex = /^[0-9]{8}[A-Za-z]$/;
  if (!regex.test(dni)) return false;
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(dni.substring(0, 8), 10);
  return letras[numero % 23].toUpperCase() === dni[8].toUpperCase();
};

const validarFecha = (fecha: string) =>
  /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/.test(fecha);

const validarContrasenaFuerte = (pass: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);

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
