import { supabase } from '../lib/supabase';

export type Filtro = 'todas' | 'gana' | 'pierde';
export type Apuesta = {
  id: number;
  monto: number;
  resultado: 'gana' | 'pierde';
  ganancia: number;
  fecha: string;
  nota: string | null;
  juegos: { nombre: string; tipo: string } | null;
};

export const POR_PAGINA = 8;

export async function listarApuestas(filtro: Filtro, pagina: number): Promise<Apuesta[]> {
  let q = supabase
    .from('apuestas')
    .select('id, monto, resultado, ganancia, fecha, nota, juegos(nombre, tipo)')
    .order('fecha', { ascending: false });
  if (filtro !== 'todas') q = q.eq('resultado', filtro);
  const desde = pagina * POR_PAGINA;
  const { data, error } = await q.range(desde, desde + POR_PAGINA - 1);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Apuesta[];
}

export async function actualizarNota(id: number, nota: string): Promise<void> {
  const { error } = await supabase.from('apuestas').update({ nota: nota.trim() || null }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function borrarApuesta(id: number): Promise<void> {
  const { error } = await supabase.from('apuestas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function resumenApuestas(): Promise<{ total: number; ganadas: number }> {
  const [t, g] = await Promise.all([
    supabase.from('apuestas').select('id', { count: 'exact', head: true }),
    supabase.from('apuestas').select('id', { count: 'exact', head: true }).eq('resultado', 'gana'),
  ]);
  if (t.error) throw new Error(t.error.message);
  if (g.error) throw new Error(g.error.message);
  return { total: t.count ?? 0, ganadas: g.count ?? 0 };
}