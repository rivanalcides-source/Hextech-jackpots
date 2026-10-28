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

export default function JuegoRuleta() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);

  const [apuesta, setApuesta] = useState('100');
  const [color, setColor] = useState<'rojo' | 'negro'>('rojo');
  const [res, setRes] = useState('');
  const [cargando, setCargando] = useState(false);

  const jugar = async () => {
    setRes('');
    const monto = parseInt(apuesta, 10);
    if (isNaN(monto) || monto > saldo) return;

    setCargando(true);
    const salioRojo = Math.random() > 0.5;
    const gano = (color === 'rojo' && salioRojo) || (color === 'negro' && !salioRojo);
    const ganancia = gano ? monto * 2 : 0;

    try {
      const { data: auth } = await supabase.auth.getUser();
      await supabase.from('apuestas').insert({ usuario_id: auth.user?.id, juego_id: 2, monto, resultado: gano ? 'gana' : 'pierde', ganancia });
      await supabase.from('billeteras').update({ saldo: saldo - monto + ganancia }).eq('usuario_id', auth.user?.id);
      setSaldo(await obtenerSaldo());
      setRes(gano ? `¡Cayó ${salioRojo ? 'Rojo' : 'Negro'}, Ganaste ⬡ ${ganancia}!` : `Cayó ${salioRojo ? 'Rojo' : 'Negro'}, perdiste.`);
    } catch {
      setRes('Error de conexión.');
    } finally { setCargando(false); }
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.volver}><Text style={styles.volverTxt}>← Volver</Text></Pressable>
      <Text style={styles.titulo}>RULETA HEXTECH</Text>
      <Text style={styles.saldo}>Saldo: ⬡ {saldo}</Text>
      
      <View style={styles.opciones}>
        <Pressable onPress={() => setColor('rojo')} style={[styles.btnRojo, color === 'rojo' && styles.on]}><Text style={styles.txtOp}>ROJO</Text></Pressable>
        <Pressable onPress={() => setColor('negro')} style={[styles.btnNegro, color === 'negro' && styles.on]}><Text style={styles.txtOp}>NEGRO</Text></Pressable>
      </View>
      
      <CampoTexto placeholder="Monto" keyboardType="numeric" value={apuesta} onChangeText={setApuesta} />
      {!!res && <Text style={styles.resultado}>{res}</Text>}
      <BotonHex titulo="GIRAR RULETA" onPress={jugar} cargando={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, padding: 20 }, volver: { marginBottom: 12 }, volverTxt: { color: colors.cian, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '900', color: colors.cian, textAlign: 'center', marginBottom: 10 },
  saldo: { color: colors.dorado, textAlign: 'center', fontSize: 18, marginBottom: 20 },
  opciones: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnRojo: { flex: 1, padding: 15, backgroundColor: '#dc2626', alignItems: 'center', borderRadius: 10 },
  btnNegro: { flex: 1, padding: 15, backgroundColor: '#171717', alignItems: 'center', borderRadius: 10 },
  on: { borderWidth: 3, borderColor: colors.cian },
  txtOp: { color: '#fff', fontWeight: '900', fontSize: 16 },
  resultado: { color: colors.verde, textAlign: 'center', marginBottom: 10, fontSize: 16, fontWeight: 'bold' }
});