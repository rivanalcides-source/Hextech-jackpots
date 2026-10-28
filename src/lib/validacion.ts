export const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());
export const passwordValida = (p: string) => p.length >= 6;

export function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('user already registered')) return 'Ya existe una cuenta con ese correo.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de entrar.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener mínimo 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
  if (m.includes('network') || m.includes('fetch')) return 'Sin conexión. Revisa tu internet.';
  return 'Ocurrió un error. Inténtalo de nuevo.';
}