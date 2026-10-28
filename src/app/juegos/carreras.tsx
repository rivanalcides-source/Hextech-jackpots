import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { obtenerSaldo } from '../../services/billetera';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');
const DISTANCIA_PISTA = width - 110;

export default function JuegoCarreras() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);

  const [apuesta, setApuesta] = useState('100');
  const [caballoElegido, setCaballoElegido] = useState(1);
  const [res, setRes] = useState('');
  const [cargando, setCargando] = useState(false);

  const animaciones = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const jugar = async () => {
    setRes('');
    const monto = parseInt(apuesta, 10);
    if (isNaN(monto) || monto > saldo) return;
    setCargando(true);

    animaciones.forEach((anim) => anim.setValue(0));

    const ganadorReal = Math.floor(Math.random() * 4) + 1;
    const gano = caballoElegido === ganadorReal;
    const ganancia = gano ? monto * 4 : 0;

    const animacionesCarrera = animaciones.map((anim, index) => {
      const esGanador = index + 1 === ganadorReal;
      const duracion = esGanador ? 2000 : 2500 + Math.random() * 1000;

      return Animated.timing(anim, {
        toValue: DISTANCIA_PISTA,
        duration: duracion,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      });
    });

    Animated.parallel(animacionesCarrera).start(async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        await supabase.from('apuestas').insert({
          usuario_id: auth.user?.id,
          juego_id: 4,
          monto,
          resultado: gano ? 'gana' : 'pierde',
          ganancia,
        });
        await supabase.from('billeteras').update({
          saldo: saldo - monto + ganancia,
        }).eq('usuario_id', auth.user?.id);

        setSaldo(await obtenerSaldo());
        setRes(gano ? `¡Ganó el #${ganadorReal}! Ganaste ⬡ ${ganancia}` : `Ganó el #${ganadorReal}. Perdiste.`);
      } catch {
        setRes('Error de conexión al guardar la apuesta.');
      } finally {
        setCargando(false);
      }
    });
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.volverTxt}>← Volver</Text>
      </Pressable>
      <Text style={styles.titulo}>CARRERAS</Text>
      <Text style={styles.saldo}>Saldo: ⬡ {saldo}</Text>

      <View style={styles.pistaCaja}>
        {[1, 2, 3, 4].map((num, i) => (
          <View key={num} style={styles.carril}>
            <Text style={styles.metaTxt}>META</Text>
            <Animated.View style={{ transform: [{ translateX: animaciones[i] }] }}>
              <Pressable
                onPress={() => !cargando && setCaballoElegido(num)}
                style={[styles.btnCaballo, caballoElegido === num && styles.on]}
              >
                <Text style={styles.txtOp}>🏇 #{num}</Text>
              </Pressable>
            </Animated.View>
          </View>
        ))}
      </View>

      <CampoTexto placeholder="Monto" keyboardType="numeric" value={apuesta} onChangeText={setApuesta} />
      {!!res && <Text style={styles.resultado}>{res}</Text>}
      <BotonHex titulo={cargando ? 'CORRIENDO...' : 'INICIAR CARRERA'} onPress={jugar} cargando={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, padding: 20 },
  volver: { marginBottom: 12 },
  volverTxt: { color: colors.cian, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '900', color: colors.cian, textAlign: 'center', marginBottom: 10 },
  saldo: { color: colors.dorado, textAlign: 'center', fontSize: 18, marginBottom: 20 },
  pistaCaja: { backgroundColor: colors.panel, paddingVertical: 10, borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  carril: { borderBottomWidth: 1, borderBottomColor: colors.borde, paddingVertical: 10, paddingHorizontal: 10, justifyContent: 'center' },
  metaTxt: { position: 'absolute', right: 10, color: colors.textoSuave, fontSize: 10, opacity: 0.3, fontWeight: '900' },
  btnCaballo: { width: 70, paddingVertical: 10, backgroundColor: colors.fondo, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: colors.borde },
  on: { borderColor: colors.cian, backgroundColor: '#164e63' },
  txtOp: { color: colors.texto, fontWeight: '900', fontSize: 14 },
  resultado: { color: colors.verde, textAlign: 'center', marginBottom: 10, fontSize: 16, fontWeight: 'bold' },
});