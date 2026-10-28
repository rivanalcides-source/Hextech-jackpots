import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { Cargando } from '../../components/Cargando';
import { ErrorCaja } from '../../components/ErrorCaja';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { resumenApuestas } from '../../services/apuestas';
import { actualizarPerfil, obtenerPerfil } from '../../services/perfil';
import { useStore } from '../../store/useStore';

const AVATARES = ['⬡', '🦊', '🐉', '👑', '🎯', '🔮'];

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const session = useStore((s) => s.session);
  const saldo = useStore((s) => s.saldo);
  const [nombre, setNombre] = useState('');
  const [avatar, setAvatar] = useState('⬡');
  const [resumen, setResumen] = useState({ total: 0, ganadas: 0 });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [p, r] = await Promise.all([obtenerPerfil(), resumenApuestas()]);
      setNombre(p.nombre);
      setAvatar(p.avatar ?? '⬡');
      setResumen(r);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el perfil.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const guardar = async () => {
    setError('');
    setOk('');
    const n = nombre.trim();
    if (n.length < 2 || n.length > 30) {
      setError('El nombre debe tener entre 2 y 30 caracteres.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfil(n, avatar);
      setOk('Perfil actualizado.');
    } catch (e: any) {
      setError(e.message ?? 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <View style={[styles.fondo, { paddingTop: insets.top }]}><Cargando /></View>;

  return (
    <ScrollView style={styles.fondo} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16 }}>
      <View style={styles.cabecera}>
        <View style={styles.avatarGrande}><Text style={styles.avatarTxt}>{avatar}</Text></View>
        <Text style={styles.email}>{session?.user.email}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statNum}>{resumen.total}</Text><Text style={styles.statEt}>APUESTAS</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{resumen.ganadas}</Text><Text style={styles.statEt}>GANADAS</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: colors.dorado }]}>{saldo.toLocaleString('es-CO')}</Text><Text style={styles.statEt}>SALDO</Text></View>
      </View>

      <Text style={styles.seccion}>EDITAR PERFIL</Text>
      <CampoTexto placeholder="Nombre de jugador" autoCapitalize="words" value={nombre} onChangeText={setNombre} maxLength={30} />

      <Text style={styles.etiqueta}>Elige tu avatar</Text>
      <View style={styles.avatares}>
        {AVATARES.map((a) => (
          <Pressable key={a} onPress={() => setAvatar(a)} style={[styles.opcion, avatar === a && styles.opcionOn]}>
            <Text style={{ fontSize: 24 }}>{a}</Text>
          </Pressable>
        ))}
      </View>

      {!!error && <ErrorCaja mensaje={error} />}
      {!!ok && <Text style={styles.ok}>{ok}</Text>}
      <BotonHex titulo="GUARDAR CAMBIOS" onPress={guardar} cargando={guardando} />

      <Pressable onPress={() => supabase.auth.signOut()} style={{ marginTop: 28 }}>
        <Text style={styles.salir}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colors.fondo },
  cabecera: { alignItems: 'center', marginBottom: 20 },
  avatarGrande: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.morado, alignItems: 'center', justifyContent: 'center', shadowColor: colors.cian, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
  avatarTxt: { fontSize: 38, color: colors.texto },
  email: { color: colors.textoSuave, marginTop: 10 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borde, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statNum: { color: colors.cian, fontSize: 20, fontWeight: '900' },
  statEt: { color: colors.textoSuave, fontSize: 10, letterSpacing: 2, marginTop: 2 },
  seccion: { color: colors.cian, letterSpacing: 4, fontWeight: '800', marginBottom: 12 },
  etiqueta: { color: colors.textoSuave, marginBottom: 8 },
  avatares: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  opcion: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borde, alignItems: 'center', justifyContent: 'center' },
  opcionOn: { borderColor: colors.cian, borderWidth: 2 },
  ok: { color: colors.verde, marginBottom: 8 },
  salir: { color: colors.error, textAlign: 'center', fontWeight: '800' },
});