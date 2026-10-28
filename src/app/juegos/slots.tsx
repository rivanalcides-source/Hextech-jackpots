import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { obtenerSaldo } from '../../services/billetera';
import { useStore } from '../../store/useStore';

const SIMBOLOS = ['🍒', '🍋', '💎', '7️⃣'];

export default function JuegoSlots() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);

  const [apuestaInput, setApuestaInput] = useState('100');
  const [carriles, setCarriles] = useState(['🎰', '🎰', '🎰']);
  const [resultado, setResultado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const jugar = async () => {
    setError('');
    setResultado('');
    const monto = parseInt(apuestaInput, 10);

    if (isNaN(monto) || monto < 10) return setError('La apuesta mínima es 10.');
    if (monto > saldo) return setError('Saldo insuficiente.');

    setCargando(true);
    const r1 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
    const r2 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
    const r3 = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
    setCarriles([r1, r2, r3]);

    let multiplicador = 0;
    if (r1 === r2 && r2 === r3) multiplicador = 5;
    else if (r1 === r2 || r2 === r3 || r1 === r3) multiplicador = 1;

    const gano = multiplicador > 0;
    const ganancia = monto * multiplicador;

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error('Sin sesión activa.');

      await supabase.from('apuestas').insert({
        usuario_id: userId, juego_id: 3, monto, resultado: gano ? 'gana' : 'pierde', ganancia,
      });

      const nuevoSaldo = saldo - monto + ganancia;
      await supabase.from('billeteras').update({ saldo: nuevoSaldo }).eq('usuario_id', userId);
      
      setSaldo(await obtenerSaldo());
      setResultado(gano ? `¡Ganaste ⬡ ${ganancia}!` : `Perdiste ⬡ ${monto}`);
    } catch (e: any) {
      setError('Error al conectar.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.volverTxt}>← Volver</Text>
      </Pressable>
      <Text style={styles.titulo}>NÚCLEOS HEXTECH</Text>
      <View style={styles.panelSaldo}>
        <Text style={styles.saldoTxt}>Saldo: ⬡ {saldo.toLocaleString('es-CO')}</Text>
      </View>
      <View style={styles.carrilesCaja}>
        {carriles.map((c, i) => <Text key={i} style={styles.simbolo}>{c}</Text>)}
      </View>
      <CampoTexto placeholder="Apuesta" keyboardType="numeric" value={apuestaInput} onChangeText={setApuestaInput} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!resultado && <Text style={styles.resultado}>{resultado}</Text>}
      <BotonHex titulo="TIRAR PALANCA" onPress={jugar} cargando={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, padding: 20 },
  volver: { marginBottom: 12 }, volverTxt: { color: colors.cian, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '900', color: colors.cian, textAlign: 'center', marginBottom: 20 },
  panelSaldo: { backgroundColor: colors.panel, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  saldoTxt: { color: colors.texto, fontWeight: '700' },
  carrilesCaja: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20, backgroundColor: colors.panel, padding: 20, borderRadius: 16 },
  simbolo: { fontSize: 50 },
  error: { color: colors.error, textAlign: 'center', marginBottom: 10 },
  resultado: { color: colors.verde, textAlign: 'center', fontSize: 18, fontWeight: '900', marginBottom: 10 },
});