import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Verificamos si estamos en las pantallas de inicio de sesión o registro
    const enAuth = segments[0] === 'login' || segments[0] === 'register';

    if (!session && !enAuth) {
      // Si NO hay sesión y tratas de entrar a juegos o tabs, te manda al login
      router.replace('/login' as any);
    } else if (session && enAuth) {
      // Si SÍ hay sesión e intentas ir al login/register, te devuelve al Home
      router.replace('/(tabs)/home' as any);
    }
  }, [session, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  );
}