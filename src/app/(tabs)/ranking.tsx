import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cargando } from '../../components/Cargando';
import { ErrorCaja } from '../../components/ErrorCaja';
import { Vacio } from '../../components/Vacio';
import { colors } from '../../constants/theme';
import { Jugador, obtenerRanking } from '../../services/ranking';

const MEDALLAS = ['🥇', '🥈', '🥉'];

export default function Ranking() {
  const insets = useSafeAreaInsets();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      setJugadores(await obtenerRanking());
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el ranking.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  return (
    <ScrollView style={styles.fondo} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16 }}>
      <Text style={styles.titulo}>RANKING</Text>
      <Text style={styles.sub}>Top jugadores por ganancias</Text>

      {cargando && <Cargando />}
      {!!error && <ErrorCaja mensaje={error} onReintentar={cargar} />}
      {!cargando && !error && jugadores.length === 0 && (
        <Vacio emoji="🏆" titulo="Todavía no hay jugadores en el ranking" texto="Juega para ser el primero." />
      )}

      {jugadores.map((j, i) => (
        <View key={`${j.nombre}-${i}`} style={styles.fila}>
          <Text style={styles.pos}>{MEDALLAS[i] ?? i + 1}</Text>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{j.avatar ?? j.nombre.charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.nombre}>{j.nombre}</Text>
          <Text style={styles.valor}>⬡ {j.total_ganado.toLocaleString('es-CO')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  titulo: { fontSize: 26, fontWeight: '900', color: colors.cian, textAlign: 'center', letterSpacing: 4 },
  sub: { color: colors.dorado, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 12, marginBottom: 8 },
  pos: { width: 30, textAlign: 'center', fontSize: 18, fontWeight: '900', color: colors.textoSuave },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.morado, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: '900', color: colors.texto },
  nombre: { flex: 1, color: colors.texto, fontWeight: '700', fontSize: 15 },
  valor: { color: colors.dorado, fontWeight: '900' },
});