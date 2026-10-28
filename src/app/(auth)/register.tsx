import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { BotonHex } from '../../components/BotonHex';
import { CampoTexto } from '../../components/CampoTexto';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { correoValido, passwordValida, traducirError } from '../../lib/validacion';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    setError('');
    setAviso('');
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener mínimo 2 caracteres.');
      return;
    }
    if (nombre.trim().length > 30) {
      setError('El nombre no puede tener más de 30 caracteres.');
      return;
    }
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
      const { data, error } = await supabase.auth.signUp({
        email: correo.trim(),
        password,
        options: { data: { nombre: nombre.trim() } },
      });
      if (error) setError(traducirError(error.message));
      else if (!data.session)
        setAviso('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
      else setAviso('¡Cuenta creada! Entrando…');
      // Si hay sesión, el layout raíz te lleva solo al casino.
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
      <Text style={styles.titulo}>CREAR CUENTA</Text>
      <Text style={styles.subtitulo}>Recibe 1.000 Hexcoins de bienvenida</Text>

      <View style={styles.form}>
        <CampoTexto placeholder="Nombre de jugador" autoCapitalize="words" value={nombre} onChangeText={setNombre} />
        <CampoTexto placeholder="Correo" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
        <CampoTexto placeholder="Contraseña (mín. 6)" secureTextEntry value={password} onChangeText={setPassword} />
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}
        <BotonHex titulo="REGISTRARME" onPress={registrar} cargando={cargando} />
        <Link href="/login" style={styles.link}>
          ¿Ya tienes cuenta? <Text style={{ color: colors.dorado }}>Inicia sesión</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.fondo, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 28, fontWeight: '900', color: colors.cian, textAlign: 'center', letterSpacing: 4 },
  subtitulo: { color: colors.dorado, textAlign: 'center', marginBottom: 28, marginTop: 6 },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  error: { color: colors.error, marginBottom: 8 },
  aviso: { color: colors.cian, marginBottom: 8 },
  link: { color: colors.textoSuave, textAlign: 'center', marginTop: 20 },
});