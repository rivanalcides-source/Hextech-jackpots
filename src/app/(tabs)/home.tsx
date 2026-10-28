import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cargando } from '../../components/Cargando';
import { ErrorCaja } from '../../components/ErrorCaja';
import { INFO_JUEGO } from '../../constants/juegos';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { resumenApuestas } from '../../services/apuestas';
import { obtenerSaldo } from '../../services/billetera';
import { Juego, agregarFavorito, listarFavoritos, listarJuegos, quitarFavorito } from '../../services/juegos';
import { obtenerPerfil } from '../../services/perfil';
import { useStore } from '../../store/useStore';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const saldo = useStore((s) => s.saldo);
  const setSaldo = useStore((s) => s.setSaldo);
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [resumen, setResumen] = useState({ total: 0, ganadas: 0 });
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [s, lista, favs, res, perfil] = await Promise.all([
        obtenerSaldo(), listarJuegos(), listarFavoritos(), resumenApuestas(), obtenerPerfil(),
      ]);
      setSaldo(s);
      setJuegos(lista);
      setFavoritos(favs);
      setResumen(res);
      setNombre(perfil.nombre);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el casino.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const alternarFavorito = async (id: number) => {
    const esFav = favoritos.includes(id);
    setFavoritos((f) => (esFav ? f.filter((x) => x !== id) : [...f, id]));
    try {
      if (esFav) await quitarFavorito(id);
      else await agregarFavorito(id);
    } catch {
      setFavoritos((f) => (esFav ? [...f, id] : f.filter((x) => x !== id)));
      setError('No se pudo actualizar el favorito.');
    }
  };

  const ordenados = [...juegos].sort((a, b) => Number(favoritos.includes(b.id)) - Number(favoritos.includes(a.id)));
  const acierto = resumen.total > 0 ? Math.round((resumen.ganadas / resumen.total) * 100) : 0;

  if (cargando) {
    return <View style={[styles.fondo, { paddingTop: insets.top }]}><Cargando /></View>;
  }

  return (
    <ScrollView style={styles.fondo} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16 }}>
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.saludo}>Bienvenido,</Text>
          <Text style={styles.nombre}>{nombre || 'Jugador'}</Text>
        </View>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.salir}>Salir</Text>
        </Pressable>
      </View>

      <View style={styles.saldoCaja}>
        <Text style={styles.saldoEtiqueta}>TU SALDO</Text>
        <Text style={styles.saldo}>⬡ {saldo.toLocaleString('es-CO')}</Text>
      </View>

      {!!error && <ErrorCaja mensaje={error} onReintentar={cargar} />}

      {resumen.total > 0 ? (
        <View style={styles.metricas}>
          <View style={styles.metrica}><Text style={styles.metricaNum}>{resumen.total}</Text><Text style={styles.metricaEt}>APUESTAS</Text></View>
          <View style={styles.metrica}><Text style={styles.metricaNum}>{resumen.ganadas}</Text><Text style={styles.metricaEt}>GANADAS</Text></View>
          <View style={styles.metrica}><Text style={styles.metricaNum}>{acierto}%</Text><Text style={styles.metricaEt}>ACIERTO</Text></View>
        </View>
      ) : (
        <Text style={styles.vacio}>Aún no has apostado. ¡Elige un juego para empezar!</Text>
      )}

      <Text style={styles.seccion}>JUEGOS</Text>
      {ordenados.length === 0 && !error && <Text style={styles.vacio}>No hay juegos disponibles por ahora.</Text>}
      <View style={styles.grilla}>
        {ordenados.map((j) => {
          const info = INFO_JUEGO[j.tipo];
          if (!info) return null;
          const esFav = favoritos.includes(j.id);
          return (
            <Pressable
              key={j.id}
              onPress={() => router.push(info.ruta as any)}
              style={({ pressed }) => [styles.tarjeta, { borderColor: info.color }, pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 }]}
            >
              <Pressable onPress={() => alternarFavorito(j.id)} style={styles.estrella} hitSlop={10}>
                <Text style={{ fontSize: 20, color: esFav ? colors.dorado : colors.textoSuave }}>{esFav ? '★' : '☆'}</Text>
              </Pressable>
              <Text style={styles.emoji}>{info.emoji}</Text>
              <Text style={[styles.juegoNombre, { color: info.color }]}>{j.nombre}</Text>
              <Text style={styles.rango}>{j.apuesta_min} – {j.apuesta_max.toLocaleString('es-CO')}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saludo: { color: colors.textoSuave },
  nombre: { color: colors.texto, fontSize: 22, fontWeight: '800' },
  salir: { color: colors.error, fontWeight: '700' },
  saldoCaja: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.dorado, borderRadius: 16,
    padding: 20, marginVertical: 20, alignItems: 'center',
    shadowColor: colors.dorado, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  saldoEtiqueta: { color: colors.textoSuave, letterSpacing: 3, fontSize: 12 },
  saldo: { color: colors.dorado, fontSize: 40, fontWeight: '900', marginTop: 4 },
  metricas: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metrica: { flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  metricaNum: { color: colors.cian, fontSize: 22, fontWeight: '900' },
  metricaEt: { color: colors.textoSuave, fontSize: 10, letterSpacing: 2, marginTop: 2 },
  vacio: { color: colors.textoSuave, textAlign: 'center', marginBottom: 20 },
  seccion: { color: colors.cian, letterSpacing: 4, fontWeight: '800', marginBottom: 12 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarjeta: { width: '48%', backgroundColor: colors.panel, borderWidth: 1.5, borderRadius: 16, paddingVertical: 24, alignItems: 'center', marginBottom: 14 },
  estrella: { position: 'absolute', top: 6, right: 10, zIndex: 2 },
  emoji: { fontSize: 44, marginBottom: 8 },
  juegoNombre: { fontSize: 16, fontWeight: '800' },
  rango: { color: colors.textoSuave, fontSize: 12, marginTop: 4 },
});