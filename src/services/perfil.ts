import { supabase } from '../lib/supabase';

export type Perfil = { id: string; nombre: string; avatar: string | null };

export async function obtenerPerfil(): Promise<Perfil> {
  const { data, error } = await supabase.from('perfiles').select('id, nombre, avatar').single();
  if (error) throw new Error(error.message);
  return data as Perfil;
}

export async function actualizarPerfil(nombre: string, avatar: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const id = auth.user?.id;
  if (!id) throw new Error('No hay una sesión activa.');
  const { error } = await supabase.from('perfiles').update({ nombre: nombre.trim(), avatar }).eq('id', id);
  if (error) throw new Error(error.message);
}