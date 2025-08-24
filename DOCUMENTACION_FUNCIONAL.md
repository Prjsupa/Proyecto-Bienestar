# Documentación Funcional - Plataforma de Bienestar Marivi Power

Este documento detalla las funcionalidades, capacidades y restricciones para cada rol de usuario dentro de la plataforma.

---

## 1. Usuario Regular (Cliente)

El usuario regular es el consumidor principal de la plataforma. Su experiencia está centrada en el consumo de contenido y la interacción para alcanzar sus metas de bienestar.

### 1.1. Registro y Flujo Inicial
- **Registro**: El usuario se registra con nombre, apellido, correo y contraseña. Por defecto, se le asigna el **rol 0**.
- **Formulario de Salud Obligatorio**: Tras confirmar su correo e iniciar sesión por primera vez, el usuario es redirigido forzosamente a un formulario de salud. No puede acceder a ninguna otra sección de la plataforma hasta que complete y guarde este formulario.
- **Entorno de Entrenamiento**: Una de las preguntas del formulario inicial define su entorno de entrenamiento (`casa` o `gimnasio`), lo que personaliza el contenido que verá.

### 1.2. Panel de Control (Dashboard)
- Muestra un saludo personalizado.
- **Resumen Diario**: Visualiza la "Receta del Día" y la "Rutina del Día" más recientes publicadas por los profesionales.
- **Próxima Cita**: Muestra la información de su próxima cita agendada o un botón para agendar una si no tiene ninguna.
- Acceso rápido a las secciones de Recetas, Rutinas y Comunidad.

### 1.3. Contenido
- **Recetas**: Puede ver todas las recetas marcadas como "visibles" por los profesionales.
- **Rutinas**: Ve únicamente las rutinas correspondientes a su entorno (`casa` o `gimnasio`) que estén marcadas como "visibles".
- **Clases en Vivo**:
    - Ve las clases futuras y las que están actualmente en vivo.
    - Puede acceder a las grabaciones de clases pasadas hasta su fecha de expiración (15 días después de la emisión).
    - Puede participar en el chat en tiempo real durante una clase en vivo.

### 1.4. Interacción y Comunidad
- **Comunidad - Feed**:
    - Puede crear nuevas publicaciones, incluyendo texto y una imagen opcional.
    - Puede responder a cualquier publicación.
    - Puede editar y eliminar **únicamente sus propias** publicaciones y respuestas.
- **Comunidad - Pregúntale a un Profesional**:
    - Puede publicar una nueva pregunta para los profesionales, incluyendo texto y una imagen opcional.
    - Puede responder a las preguntas (generalmente para añadir contexto a su propia pregunta).
    - Puede editar y eliminar **únicamente sus propias** preguntas.
- **Clínica de la Técnica**:
    - Puede subir un video (con una nota opcional) para que un profesional analice su técnica.
    - Puede ver y responder al feedback que los profesionales dejan en sus videos.
    - Puede editar y eliminar **únicamente sus propias** publicaciones de video.

### 1.5. Citas y Perfil
- **Agendar Cita**:
    - Puede ver la disponibilidad de los profesionales (excluyendo días y horarios ya ocupados).
    - Puede agendar una nueva cita en un horario disponible.
    - Puede posponer o cancelar sus citas existentes.
- **Perfil**:
    - Puede ver y actualizar su información personal (nombre, apellido).
    - Puede acceder y editar sus respuestas del formulario de salud en cualquier momento.
- **Notificaciones**: Recibe notificaciones cuando un moderador elimina uno de sus contenidos.

---

## 2. Profesional (Rol 1)

El profesional es el creador de contenido y el experto que guía a los usuarios. Tiene permisos elevados para gestionar el contenido de la plataforma.

### 2.1. Panel de Control (Dashboard)
- Visualiza estadísticas clave de la plataforma: número total de recetas, rutinas y citas pendientes.
- Tiene "Acciones Rápidas" para navegar directamente a las secciones de gestión de contenido.

### 2.2. Gestión de Contenido
- **Recetas**:
    - Tiene acceso a un gestor completo de recetas.
    - Puede **crear, editar y eliminar** cualquier receta.
    - Puede controlar la visibilidad (`visible` / `oculto`) de cada receta.
    - Puede filtrar las recetas por estado de visibilidad.
- **Rutinas**:
    - Tiene acceso a un gestor de rutinas, separado por entorno (`casa` y `gimnasio`).
    - Puede **crear, editar y eliminar** cualquier rutina en ambos entornos.
    - Puede controlar la visibilidad (`visible` / `oculto`) de cada rutina.
    - Puede filtrar las rutinas por estado de visibilidad.
- **Clases en Vivo**:
    - Puede **crear, programar, editar y eliminar** clases en vivo.
    - Puede añadir el enlace de la transmisión y una imagen en miniatura.
- **Comunidad - Anuncios**:
    - Es el único rol que puede **crear, editar y eliminar** anuncios en la pestaña "Anuncios de Profesionales".

### 2.3. Interacción con Usuarios
- **Comunidad - Pregúntale a un Profesional**:
    - Puede ver todas las preguntas de los usuarios.
    - Puede publicar respuestas a cualquier pregunta.
- **Clínica de la Técnica**:
    - Puede ver todos los videos subidos por los usuarios.
    - Puede publicar respuestas de feedback en cualquier video.
- **Gestión de Citas**:
    - Ve una lista de todas las citas agendadas por los usuarios.
    - Puede filtrar las citas por día.
    - Puede **confirmar** o **cancelar** las citas de los usuarios.

### 2.4. Restricciones
- No puede modificar perfiles de usuario.
- No participa en las funciones de moderación de la comunidad (eliminar contenido de otros usuarios).
- No tiene acceso a las herramientas de moderación (gestión de usuarios, registros, historial).

---

## 3. Moderador (Rol 2)

El moderador se encarga de mantener el orden y la seguridad en la plataforma. Tiene permisos para ver todo el contenido y gestionar a los usuarios.

### 3.1. Panel de Control (Dashboard)
- Visualiza estadísticas de moderación: número total de usuarios regulares y acciones de moderación del día.
- Tiene acceso directo a las "Herramientas de Moderación".

### 3.2. Herramientas de Moderación
- **Gestionar Usuarios**:
    - Puede ver una lista de **todos los usuarios** de la plataforma, separados por rol (Usuarios, Profesionales, Moderadores).
    - Puede ver el entorno de entrenamiento (`casa` o `gimnasio`) de los usuarios regulares.
    - Puede **editar el entorno de entrenamiento** de los usuarios con rol 0.
- **Gestionar Registros**:
    - Puede **activar o desactivar** los enlaces de registro especiales para nuevos Profesionales y Moderadores.
    - Ve un historial de todos los usuarios registrados con roles especiales.
- **Historial de Moderación**:
    - Ve un registro inmutable de todas las acciones de moderación realizadas en la plataforma (quién eliminó qué, cuándo y por qué).

### 3.3. Acciones de Moderación en la Comunidad
- **Comunidad (Feed y Preguntas)** y **Clínica de Técnica**:
    - Puede ver todo el contenido (publicaciones, preguntas, videos, respuestas).
    - Puede **eliminar cualquier publicación, pregunta, video o respuesta** creada por un usuario regular (rol 0).
    - Al eliminar contenido, debe proporcionar una razón, que queda registrada en el historial y notifica al usuario afectado.

### 3.4. Restricciones
- **No puede** editar el contenido de los usuarios (solo eliminar).
- **No puede** crear contenido en nombre de los usuarios o profesionales (recetas, rutinas, anuncios).
- **No puede** gestionar citas.
- **No puede** modificar el rol de los usuarios.
