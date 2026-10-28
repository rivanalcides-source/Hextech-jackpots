import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

type Props = { titulo: string; onPress: () => void; cargando?: boolean };

export function BotonHex({ titulo, onPress, cargando }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
    >
      {cargando ? (
        <ActivityIndicator color={colors.fondo} />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: colors.cian,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.cian,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  presionado: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  texto: { color: colors.fondo, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});