import { colors } from './theme';

export const INFO_JUEGO: Record<string, { ruta: string; emoji: string; color: string }> = {
  cartas: { ruta: '/juegos/blackjack', emoji: '🃏', color: colors.cian },
  ruleta: { ruta: '/juegos/ruleta', emoji: '🎡', color: colors.morado },
  slots: { ruta: '/juegos/slots', emoji: '🎰', color: colors.dorado },
  caballos: { ruta: '/juegos/carreras', emoji: '🏇', color: colors.verde },
  dados: { ruta: '/juegos/dados', emoji: '🎲', color: colors.error },
};