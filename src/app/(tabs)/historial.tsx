import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { Cargando } from '../../components/Cargando';
import { ErrorCaja } from '../../components/ErrorCaja';
import { Vacio } from '../../components/Vacio';
import { INFO_JUEGO } from '../../constants/juegos';
import { colors } from '../../constants/theme';
import { Apuesta, Filtro, POR_PAGINA, actualizarNota, borrarApuesta, listarApuestas } from '../../services/apuestas';

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todas', texto: 'TODAS' },
  { id: 'gana', texto: 'GANADAS' },
  { id: 'pierde', texto: 'PERDIDAS' },
];

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Historial() {
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [items, setItems] = useState<Apuesta[]>([]);
  const [pagina, setPagina] = useState(0);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<number | null>(null);
  const [textoNota, setTextoNota] = useState('');
  const [confirmando, setConfirmando] = useState<number | null>(null);

  const cargar = useCallback(async (f: Filtro) => {
    setCargando(true);
    setError('');
    try {
      const datos = await listarApuestas(f, 0);
      setItems(datos);
      setPagina(0);
      setHayMas(datos.length === POR_PAGINA);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el historial.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(filtro); }, [filtro, cargar]));

  const cargarMas = async () => {
    setCargandoMas(true);
    try {
      const datos = await listarApuestas(filtro, pagina + 1);
      setItems((prev) => [...prev, ...datos]);
      setPagina(pagina + 1);
      setHayMas(datos.length === POR_PAGINA);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar más.');
    } finally {
      setCargandoMas(false);
    }
  };

  const guardarNota = async (id: number) => {
    try {
      await actualizarNota(id, textoNota);
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, nota: textoNota.trim() || null } : a)));
      setEditando(null);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo guardar la nota.');
    }
  };

  const borrar = async (id: number) => {
    try {
      await borrarApuesta(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
      setConfirmando(null);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo borrar la apuesta.');
    }
  };

  return (
    <ScrollView style={styles.fondo} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16 }}>
      <Text style={styles.titulo}>HISTORIAL</Text>
      <Text style={styles.sub}>Tus apuestas</Text>

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Pressable key={f.id} onPress={() => setFiltro(f.id)} style={[styles.pill, filtro === f.id && styles.pillOn]}>
            <Text style={[styles.pillTxt, filtro === f.id && { color: colors.cian }]}>{f.texto}</Text>
          </Pressable>
        ))}
      </View>

      {cargando && <Cargando />}
      {!!error && <ErrorCaja mensaje={error} onReintentar={() => cargar(filtro)} />}
      {!cargando && !error && items.length === 0 && (
        <Vacio emoji="🎰" titulo="No hay apuestas para mostrar" texto="Cuando juegues, tus apuestas aparecerán aquí." />
      )}

      {!cargando && items.map((a) => {
        const info = INFO_JUEGO[a.juegos?.tipo ?? ''];
        const gano = a.resultado === 'gana';
        const neto = gano ? a.ganancia - a.monto : -a.monto;
        return (
          <View key={a.id} style={styles.fila}>
            <View style={styles.filaTop}>
              <Text style={styles.emoji}>{info?.emoji ?? '🎲'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.juego}>{a.juegos?.nombre ?? 'Juego'}</Text>
                <Text style={styles.fecha}>{formatearFecha(a.fecha)} · apostó ⬡ {a.monto.toLocaleString('es-CO')}</Text>
              </View>
              <Text style={[styles.monto, { color: gano ? colors.verde : colors.error }]}>
                {gano ? '+' : '−'} {Math.abs(neto).toLocaleString('es-CO')}
              </Text>
            </View>

            {editando === a.id ? (
              <View style={{ marginTop: 10 }}>
                <CampoTexto placeholder="Escribe una nota (máx. 200)" value={textoNota} onChangeText={setTextoNota} maxLength={200} autoCapitalize="sentences" />
                <View style={styles.acciones}>
                  <Pressable onPress={() => guardarNota(a.id)}><Text style={[styles.accion, { color: colors.cian }]}>Guardar</Text></Pressable>
                  <Pressable onPress={() => setEditando(null)}><Text style={styles.accion}>Cancelar</Text></Pressable>
                </View>
              </View>
            ) : (
              <>
                {!!a.nota && <Text style={styles.nota}>“{a.nota}”</Text>}
                <View style={styles.acciones}>
                  <Pressable onPress={() => { setEditando(a.id); setTextoNota(a.nota ?? ''); setConfirmando(null); }}>
                    <Text style={styles.accion}>✎ Nota</Text>
                  </Pressable>
                  {confirmando === a.id ? (
                    <>
                      <Pressable onPress={() => borrar(a.id)}><Text style={[styles.accion, { color: colors.error }]}>Sí, borrar</Text></Pressable>
                      <Pressable onPress={() => setConfirmando(null)}><Text style={styles.accion}>Cancelar</Text></Pressable>
                    </>
                  ) : (
                    <Pressable onPress={() => setConfirmando(a.id)}><Text style={[styles.accion, { color: colors.error }]}>🗑 Borrar</Text></Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        );
      })}

      {hayMas && !cargando && <BotonHex titulo="CARGAR MÁS" onPress={cargarMas} cargando={cargandoMas} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  titulo: { fontSize: 26, fontWeight: '900', color: colors.cian, textAlign: 'center', letterSpacing: 4 },
  sub: { color: colors.dorado, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  filtros: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.borde, backgroundColor: colors.panel },
  pillOn: { borderColor: colors.cian },
  pillTxt: { color: colors.textoSuave, fontWeight: '800', fontSize: 12 },
  fila: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, padding: 12, marginBottom: 10 },
  filaTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 26 },
  juego: { color: colors.texto, fontWeight: '800', fontSize: 15 },
  fecha: { color: colors.textoSuave, fontSize: 11, marginTop: 2 },
  monto: { fontWeight: '900', fontSize: 16 },
  nota: { color: colors.textoSuave, fontStyle: 'italic', marginTop: 8 },
  acciones: { flexDirection: 'row', gap: 18, marginTop: 10 },
  accion: { color: colors.textoSuave, fontWeight: '700', fontSize: 13 },
});