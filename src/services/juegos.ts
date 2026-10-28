import { supabase } from '../lib/supabase';

export type Juego = { id: number; nombre: string; tipo: string; apuesta_min: number; apuesta_max: number };

export async function listarJuegos(): Promise<Juego[]> {
  const { data, error } = await supabase.from('juegos').select('*').eq('activo', true).order('id');
  if (error) throw new Error(error.message);
  return (data ?? []) as Juego[];
}

export async function listarFavoritos(): Promise<number[]> {
  const { data, error } = await supabase.from('juegos_favoritos').select('juego_id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((f) => f.juego_id as number);
}

export async function agregarFavorito(juegoId: number): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const id = auth.user?.id;
  if (!id) throw new Error('No hay una sesión activa.');
  const { error } = await supabase.from('juegos_favoritos').insert({ usuario_id: id, juego_id: juegoId });
  if (error) throw new Error(error.message);
}

export async function quitarFavorito(juegoId: number): Promise<void> {
  const { error } = await supabase.from('juegos_favoritos').delete().eq('juego_id', juegoId);
  if (error) throw new Error(error.message);
}