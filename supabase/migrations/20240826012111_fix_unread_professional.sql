
create or replace function marcar_conversacion_como_leida_profesional(c_id uuid)
returns void
language sql
security definer
as $$
  update public.conversaciones
  set unread_by_professional = false
  where id = c_id;
$$;

    