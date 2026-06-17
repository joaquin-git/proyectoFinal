export const validarEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validarDNI = (dni: string): boolean => {
  if (!/^[0-9]{8}[A-Za-z]$/.test(dni)) return false;
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(dni.substring(0, 8), 10);
  return letras[numero % 23].toUpperCase() === dni[8].toUpperCase();
};

export const validarFecha = (fecha: string): boolean =>
  /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/.test(fecha);

export const validarContrasenaFuerte = (pass: string): boolean =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);
