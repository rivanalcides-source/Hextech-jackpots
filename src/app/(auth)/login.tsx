import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { correoValido, passwordValida, traducirError } from '../../lib/validacion';

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setError('');
    if (!correoValido(correo)) {
      setError('Escribe un correo válido (ej. nombre@correo.com).');
      return;
    }
    if (!passwordValida(password)) {
      setError('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password,
      });

      if (error) {
        setError(traducirError(error.message));
      } else if (data.session) {
        router.replace('/(tabs)/home' as any);
      }
    } catch {
      setError('Sin conexión. Revisa tu internet.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>⬡</Text>
      <Text style={styles.titulo}>HEXTECH</Text>
      <Text style={styles.subtitulo}>JACKPOTS</Text>

      <View style={styles.form}>
        <CampoTexto
          placeholder="Correo"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />
        <CampoTexto
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <BotonHex titulo="ENTRAR" onPress={entrar} cargando={cargando} />
        <Link href="/register" style={styles.link}>
          ¿No tienes cuenta? <Text style={{ color: colors.dorado }}>Regístrate</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 64, color: colors.cian, textAlign: 'center' },
  titulo: { fontSize: 34, fontWeight: '900', color: colors.cian, textAlign: 'center', letterSpacing: 6 },
  subtitulo: { fontSize: 18, fontWeight: '700', color: colors.dorado, textAlign: 'center', letterSpacing: 8, marginBottom: 32 },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  error: { color: colors.error, marginBottom: 8 },
  link: { color: colors.textoSuave, textAlign: 'center', marginTop: 20 },
});