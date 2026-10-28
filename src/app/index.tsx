import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Verificamos si hay una sesión activa al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Si ya inició sesión, lo mandamos directo al home (las tabs)
        router.replace('/(tabs)/home');
      } else {
        // Si no hay sesión, lo mandamos al login
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.fondo, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.dorado} />
    </View>
  );
}