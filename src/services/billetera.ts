import { supabase } from '../lib/supabase';

export async function obtenerSaldo(): Promise<number> {
  const { data, error } = await supabase.from('billeteras').select('saldo').single();
  if (error) throw new Error(error.message);
  return data.saldo as number;
}