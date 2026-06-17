import {
  validarEmail,
  validarDNI,
  validarFecha,
  validarContrasenaFuerte,
} from '../utils/validaciones';

describe('validarEmail', () => {
  it('acepta un email correcto', () => {
    expect(validarEmail('usuario@ejemplo.com')).toBe(true);
  });

  it('acepta email con subdominio', () => {
    expect(validarEmail('test@mail.co.uk')).toBe(true);
  });

  it('rechaza email sin arroba', () => {
    expect(validarEmail('usuarioejemplo.com')).toBe(false);
  });

  it('rechaza email sin dominio', () => {
    expect(validarEmail('usuario@')).toBe(false);
  });

  it('rechaza cadena vacía', () => {
    expect(validarEmail('')).toBe(false);
  });
});

describe('validarDNI', () => {
  it('acepta un DNI válido', () => {
    // 12345678 % 23 = 14 → letra 'Z'
    expect(validarDNI('12345678Z')).toBe(true);
  });

  it('acepta DNI con letra minúscula válida', () => {
    expect(validarDNI('12345678z')).toBe(true);
  });

  it('rechaza DNI con letra de control incorrecta', () => {
    expect(validarDNI('12345678A')).toBe(false);
  });

  it('rechaza DNI con menos de 8 dígitos', () => {
    expect(validarDNI('1234567Z')).toBe(false);
  });

  it('rechaza DNI sin letra al final', () => {
    expect(validarDNI('123456789')).toBe(false);
  });

  it('rechaza cadena vacía', () => {
    expect(validarDNI('')).toBe(false);
  });
});

describe('validarFecha', () => {
  it('acepta formato dd/mm/aaaa correcto', () => {
    expect(validarFecha('15/06/2000')).toBe(true);
  });

  it('acepta fecha límite 31/12/2023', () => {
    expect(validarFecha('31/12/2023')).toBe(true);
  });

  it('rechaza formato ISO aaaa-mm-dd', () => {
    expect(validarFecha('2000-06-15')).toBe(false);
  });

  it('rechaza día inválido 32', () => {
    expect(validarFecha('32/01/2000')).toBe(false);
  });

  it('rechaza mes inválido 13', () => {
    expect(validarFecha('15/13/2000')).toBe(false);
  });

  it('rechaza cadena vacía', () => {
    expect(validarFecha('')).toBe(false);
  });
});

describe('validarContrasenaFuerte', () => {
  it('acepta contraseña con mayúscula, minúscula y número', () => {
    expect(validarContrasenaFuerte('Password1')).toBe(true);
  });

  it('acepta contraseña larga y compleja', () => {
    expect(validarContrasenaFuerte('MiClave123Segura')).toBe(true);
  });

  it('rechaza contraseña sin mayúscula', () => {
    expect(validarContrasenaFuerte('password1')).toBe(false);
  });

  it('rechaza contraseña sin minúscula', () => {
    expect(validarContrasenaFuerte('PASSWORD1')).toBe(false);
  });

  it('rechaza contraseña sin número', () => {
    expect(validarContrasenaFuerte('Password')).toBe(false);
  });

  it('rechaza contraseña de menos de 8 caracteres', () => {
    expect(validarContrasenaFuerte('Pw1')).toBe(false);
  });

  it('rechaza cadena vacía', () => {
    expect(validarContrasenaFuerte('')).toBe(false);
  });
});
