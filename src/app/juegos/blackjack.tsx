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

export default function JuegoBlackjack() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);

  const [apuesta, setApuesta] = useState('100');
  const [res, setRes] = useState('');
  const [cargando, setCargando] = useState(false);

  const jugar = async () => {
    setRes('');
    const monto = parseInt(apuesta, 10);
    if (isNaN(monto) || monto > saldo) return;
    setCargando(true);

    const tuPuntaje = Math.floor(Math.random() * (21 - 16 + 1)) + 16;
    const casaPuntaje = Math.floor(Math.random() * (21 - 16 + 1)) + 16;
    
    const gano = tuPuntaje > casaPuntaje || casaPuntaje > 21;
    const empate = tuPuntaje === casaPuntaje;
    const ganancia = gano ? monto * 2 : (empate ? monto : 0);
    const dbRes = gano ? 'gana' : 'pierde'; // Empate lo contamos como pierde ganancia para simplificar en DB

    try {
      const { data: auth } = await supabase.auth.getUser();
      await supabase.from('apuestas').insert({ usuario_id: auth.user?.id, juego_id: 1, monto, resultado: dbRes, ganancia });
      await supabase.from('billeteras').update({ saldo: saldo - monto + ganancia }).eq('usuario_id', auth.user?.id);
      setSaldo(await obtenerSaldo());
      setRes(`Tú: ${tuPuntaje} | Casa: ${casaPuntaje}\n${gano ? '¡Ganaste!' : empate ? 'Empate (Devolución)' : 'Perdiste'}`);
    } catch { setRes('Error.'); } finally { setCargando(false); }
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.volver}><Text style={styles.volverTxt}>← Volver</Text></Pressable>
      <Text style={styles.titulo}>BLACKJACK RÁPIDO</Text>
      <Text style={styles.saldo}>Saldo: ⬡ {saldo}</Text>
      <CampoTexto placeholder="Monto" keyboardType="numeric" value={apuesta} onChangeText={setApuesta} />
      {!!res && <Text style={styles.resultado}>{res}</Text>}
      <BotonHex titulo="REPARTIR CARTAS" onPress={jugar} cargando={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, padding: 20 }, volver: { marginBottom: 12 }, volverTxt: { color: colors.cian, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '900', color: colors.cian, textAlign: 'center', marginBottom: 10 },
  saldo: { color: colors.dorado, textAlign: 'center', fontSize: 18, marginBottom: 20 },
  resultado: { color: colors.verde, textAlign: 'center', marginBottom: 10, fontSize: 18, fontWeight: 'bold' }
});