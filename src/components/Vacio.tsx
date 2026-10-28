import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export function Vacio({ emoji, titulo, texto }: { emoji: string; titulo: string; texto?: string }) {
  return (
    <View style={styles.caja}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      {!!texto && <Text style={styles.texto}>{texto}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', padding: 32 },
  emoji: { fontSize: 44, marginBottom: 8 },
  titulo: { color: colors.texto, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  texto: { color: colors.textoSuave, marginTop: 6, textAlign: 'center' },
});