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

export default function JuegoDados() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);

  const [apuestaInput, setApuestaInput] = useState('100');
  const [eleccion, setEleccion] = useState<'par' | 'impar'>('par');
  const [dado, setDado] = useState<number | null>(null);
  const [resultado, setResultado] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const lanzar = async () => {
    setError('');
    setResultado('');
    const monto = parseInt(apuestaInput, 10);

    if (isNaN(monto) || monto < 10) {
      setError('La apuesta mínima es de ⬡ 10.');
      return;
    }
    if (monto > saldo) {
      setError('No tienes suficiente saldo.');
      return;
    }

    setCargando(true);

    const numero = Math.floor(Math.random() * 6) + 1;
    setDado(numero);

    const esPar = numero % 2 === 0;
    const gano = (eleccion === 'par' && esPar) || (eleccion === 'impar' && !esPar);
    const ganancia = gano ? monto * 2 : 0;

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (!userId) throw new Error('No hay sesión activa.');

      // Registrar la apuesta
      const { error: errorApuesta } = await supabase.from('apuestas').insert({
        usuario_id: userId,
        juego_id: 5, // ID asignado a los dados
        monto,
        resultado: gano ? 'gana' : 'pierde',
        ganancia,
      });

      if (errorApuesta) throw new Error(errorApuesta.message);

      // Actualizar el saldo
      const nuevoSaldo = gano ? saldo + (ganancia - monto) : saldo - monto;
      const { error: errorBilletera } = await supabase
        .from('billeteras')
        .update({ saldo: nuevoSaldo })
        .eq('usuario_id', userId);

      if (errorBilletera) throw new Error(errorBilletera.message);

      const s = await obtenerSaldo();
      setSaldo(s);

      setResultado(
        gano
          ? `¡Ganaste ⬡ ${ganancia.toLocaleString('es-CO')}!`
          : `Perdiste ⬡ ${monto.toLocaleString('es-CO')}.`
      );
    } catch (e: any) {
      setError(e.message ?? 'Error al procesar la apuesta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.volverTxt}>← Volver al Casino</Text>
      </Pressable>

      <Text style={styles.titulo}>DADOS HEX</Text>
      <Text style={styles.subtitulo}>Adivina si el dado será Par o Impar</Text>

      <View style={styles.panelSaldo}>
        <Text style={styles.saldoTxt}>Saldo disponible: ⬡ {saldo.toLocaleString('es-CO')}</Text>
      </View>

      <View style={styles.dadoCaja}>
        <Text style={styles.dadoEmoji}>{dado ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dado - 1] : '🎲'}</Text>
        {dado && <Text style={styles.dadoNum}>Salió: {dado}</Text>}
      </View>

      <View style={styles.opciones}>
        <Pressable
          onPress={() => setEleccion('par')}
          style={[styles.opcion, eleccion === 'par' && styles.opcionOn]}
        >
          <Text style={[styles.opcionTxt, eleccion === 'par' && { color: colors.cian }]}>PAR</Text>
        </Pressable>
        <Pressable
          onPress={() => setEleccion('impar')}
          style={[styles.opcion, eleccion === 'impar' && styles.opcionOn]}
        >
          <Text style={[styles.opcionTxt, eleccion === 'impar' && { color: colors.cian }]}>IMPAR</Text>
        </Pressable>
      </View>

      <CampoTexto
        placeholder="Monto a apostar"
        keyboardType="numeric"
        value={apuestaInput}
        onChangeText={setApuestaInput}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!resultado && <Text style={styles.resultado}>{resultado}</Text>}

      <BotonHex titulo="LANZAR DADO" onPress={lanzar} cargando={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, padding: 20 },
  volver: { marginBottom: 12 },
  volverTxt: { color: colors.cian, fontWeight: '700' },
  titulo: { fontSize: 26, fontWeight: '900', color: colors.cian, textAlign: 'center', letterSpacing: 4 },
  subtitulo: { color: colors.dorado, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  panelSaldo: { backgroundColor: colors.panel, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  saldoTxt: { color: colors.texto, fontWeight: '700' },
  dadoCaja: { alignItems: 'center', marginVertical: 10 },
  dadoEmoji: { fontSize: 80 },
  dadoNum: { color: colors.textoSuave, fontSize: 16, marginTop: 4 },
  opciones: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  opcion: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.borde, backgroundColor: colors.panel, alignItems: 'center' },
  opcionOn: { borderColor: colors.cian, borderWidth: 2 },
  opcionTxt: { color: colors.textoSuave, fontWeight: '900', fontSize: 16 },
  error: { color: colors.error, textAlign: 'center', marginBottom: 10 },
  resultado: { color: colors.verde, textAlign: 'center', fontSize: 18, fontWeight: '900', marginBottom: 10 },
});