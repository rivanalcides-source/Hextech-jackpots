import { supabase } from '../lib/supabase';

export type Jugador = { nombre: string; avatar: string | null; total_ganado: number; saldo: number };

export async function obtenerRanking(): Promise<Jugador[]> {
  const { data, error } = await supabase.from('ranking').select('*').order('total_ganado', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Jugador[];
}