import { useState } from 'react';
import { recuperarContrasena, verificarRecuperacion } from '../../servicios/api';

export const useRecuperarContrasenaViewModel = () => {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [fase, setFase] = useState<'email' | 'codigo'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enviarCodigo = async (): Promise<boolean> => {
    if (!email.includes('@')) {
      setError('Introduce un correo electrónico válido.');
      return false;
    }
    setError('');
    setLoading(true);
    try {
      await recuperarContrasena(email);
      setFase('codigo');
      return true;
    } catch (e: any) {
      setError(e.message || 'Correo electrónico no encontrado.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cambiarContrasena = async (): Promise<boolean> => {
    if (codigo.length !== 6) { setError('El código debe tener 6 dígitos'); return false; }
    if (nuevaContrasena.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return false; }
    if (nuevaContrasena !== confirmarContrasena) { setError('Las contraseñas no coinciden'); return false; }
    setError('');
    setLoading(true);
    try {
      await verificarRecuperacion(email, codigo, nuevaContrasena);
      return true;
    } catch (e: any) {
      setError(e.message || 'Código inválido o expirado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    codigo, setCodigo,
    nuevaContrasena, setNuevaContrasena,
    confirmarContrasena, setConfirmarContrasena,
    fase, loading, error,
    enviarCodigo, cambiarContrasena,
  };
};
