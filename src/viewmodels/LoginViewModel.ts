import { useState } from 'react';
import { LoginCredentials, LoginResult } from '../models/LoginModel';
import { AuthService } from '../services/AuthService';
import { useReservas } from '../contexto/ReservasContext';

export const useLoginViewModel = (onAuthenticated?: (user: LoginResult) => void) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const auth = new AuthService();
  const { cargarReservas } = useReservas();

  const login = async () => {
    const nuevosErrores: Record<string, string> = {};
    if (!email) nuevosErrores.email = 'Introduce tu usuario o correo.';
    if (!password) nuevosErrores.password = 'Introduce tu contraseña.';
    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setLoading(true);
    try {
      const user = await auth.login({ email, password } as LoginCredentials);
      await cargarReservas();
      setLoading(false);
      onAuthenticated?.(user);
    } catch (e: any) {
      setLoading(false);
      setErrors({ password: e.message || 'Usuario, correo o contraseña incorrectos.' });
    }
  };

  return { email, password, setEmail, setPassword, loading, errors, login };
};
