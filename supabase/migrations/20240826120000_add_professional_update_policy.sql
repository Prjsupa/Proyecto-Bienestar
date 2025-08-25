
-- Nueva política para permitir a los profesionales actualizar el estado "no leído" de sus conversaciones

-- Habilitar RLS en la tabla si aún no está habilitada
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;

-- Política existente para permitir a los usuarios actualizar su propio estado "no leído" (no la modificamos, solo como referencia)
-- CREATE POLICY "Permitir a usuarios actualizar su propio unread"
-- ON public.conversaciones
-- FOR UPDATE
-- TO authenticated
-- USING (user_id = auth.uid())
-- WITH CHECK (user_id = auth.uid());

-- NUEVA POLÍTICA: Permitir a los profesionales actualizar el estado "no leído" de sus conversaciones
CREATE POLICY "Permitir a profesionales actualizar su propio unread"
ON public.conversaciones
FOR UPDATE
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- Explicación:
-- ESTA POLÍTICA PERMITE a un usuario autenticado (`TO authenticated`)
-- REALIZAR UNA OPERACIÓN DE ACTUALIZACIÓN (`FOR UPDATE`) en la tabla `conversaciones`
-- SIEMPRE Y CUANDO (`USING` y `WITH CHECK`) el `professional_id` de la fila que se está intentando modificar
-- coincida con el ID del usuario que está realizando la operación (`auth.uid()`).
-- Esto asegura que un profesional solo puede modificar el estado de las conversaciones en las que él es el profesional.
