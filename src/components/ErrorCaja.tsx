import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export function ErrorCaja({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <View style={styles.caja}>
      <Text style={styles.texto}>{mensaje}</Text>
      {onReintentar && (
        <Pressable onPress={onReintentar}>
          <Text style={styles.reintentar}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { borderWidth: 1, borderColor: colors.error, borderRadius: 12, padding: 12, marginVertical: 10 },
  texto: { color: colors.error },
  reintentar: { color: colors.cian, fontWeight: '800', marginTop: 8 },
});