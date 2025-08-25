# Documentación Funcional - Plataforma de Bienestar Marivi Power

Este documento detalla las funcionalidades, capacidades y restricciones para cada rol de usuario dentro de la plataforma.

---

## 1. Usuario Regular (Cliente)

El usuario regular es el consumidor principal de la plataforma. Su experiencia está centrada en el consumo de contenido y la interacción para alcanzar sus metas de bienestar.

### 1.1. Registro y Flujo Inicial
- **Registro**: El usuario se registra con nombre, apellido, correo y contraseña.
- **Formulario de Salud Obligatorio**: Tras confirmar su correo e iniciar sesión por primera vez, el usuario es redirigido forzosamente a un formulario de salud. No puede acceder a ninguna otra sección de la plataforma hasta que complete y guarde este formulario.
    - **Campos del Formulario**: Edad, estatura, peso, % de grasa corporal, diagnóstico médico (checkbox y campo "otro"), objetivo principal, días de ejercicio, actividad diaria, restricciones alimentarias, ciclo menstrual, uso de anticonceptivos, diagnóstico ginecológico, nivel de compromiso y entorno de entrenamiento.
- **Entorno de Entrenamiento**: Una de las preguntas del formulario inicial define su entorno de entrenamiento (`casa` o `gimnasio`), lo que personaliza el contenido que verá.

### 1.2. Panel de Control (Dashboard)
- Muestra un saludo personalizado.
- **Resumen Diario**: Visualiza la "Receta del Día" y la "Rutina del Día" en tarjetas (`Card`) que muestran el título, una breve descripción y un enlace para ver más.
- **Próxima Cita**: Muestra la información de su próxima cita agendada en una tarjeta (`Card`) destacada, incluyendo fecha y estado. Si no tiene ninguna, se muestra un botón para agendar.
- **Accesos Rápidos**: Botones que enlazan a las secciones de Recetas, Rutinas y Comunidad.

### 1.3. Contenido
- **Recetas**:
    - **Vista**: Una cuadrícula de tarjetas de recetas (`RecipeCard`) con imagen, título, categoría y descripción.
    - **Interacción**: Al hacer clic, se abre un modal (`RecipeDetailModal`) que muestra la imagen, título, descripción completa, categoría, y dos columnas para **ingredientes** y **pasos de preparación**.
    - **Acceso**: Puede ver todas las recetas marcadas como "visibles" por los profesionales.
- **Rutinas**:
    - **Vista**: Una cuadrícula de tarjetas de rutinas (`RoutineCard`) con título, descripción y equipo necesario.
    - **Interacción**: Al hacer clic, se abre un modal (`RoutineDetailModal`) que muestra el título, descripción, equipo necesario y los **ejercicios** detallados.
    - **Acceso**: Ve únicamente las rutinas correspondientes a su entorno (`casa` o `gimnasio`) que estén marcadas como "visibles".
- **Clases en Vivo**:
    - **Vista**: Una cuadrícula de tarjetas de clases (`LiveSessionCard`) con miniatura, título, fecha y hora. Las clases en curso tienen una insignia "EN VIVO".
    - **Interacción**: Al hacer clic, se abre un modal (`VideoPlayerModal`) que contiene el reproductor de video incrustado y un **chat en vivo** para interactuar durante la transmisión.
    - **Acceso**: Ve las clases futuras y las que están actualmente en vivo. Puede acceder a las grabaciones de clases pasadas hasta su fecha de expiración (15 días después de la emisión).

### 1.4. Interacción y Comunidad
- **Comunidad - Feed**:
    - **Crear Publicación**: Puede crear una publicación con un **mensaje** (texto) y adjuntar una **imagen** (opcional).
    - **Responder**: Puede responder a cualquier publicación.
    - **Editar/Eliminar**: Puede editar y eliminar **únicamente sus propias** publicaciones y respuestas.
- **Comunidad - Pregúntale a un Profesional**:
    - **Crear Pregunta**: Puede publicar una nueva pregunta con un **mensaje** (texto) y adjuntar una **imagen** (opcional).
    - **Responder**: Puede responder a las preguntas (generalmente para añadir contexto a su propia pregunta).
    - **Editar/Eliminar**: Puede editar y eliminar **únicamente sus propias** preguntas.
- **Clínica de la Técnica**:
    - **Subir Video**: Puede subir un **video** (requerido) y añadir una **nota** opcional para el profesional.
    - **Feedback**: Puede ver y responder al feedback que los profesionales dejan en sus videos.
    - **Editar/Eliminar**: Puede editar y eliminar **únicamente sus propias** publicaciones de video.

### 1.5. Citas y Perfil
- **Agendar Cita**:
    - **Vista**: Un calendario (`Calendar`) donde los días no disponibles (fines de semana, días completos) están deshabilitados.
    - **Interacción**: Al seleccionar un día válido, se muestra una lista de horarios disponibles. El usuario selecciona día y hora para confirmar.
    - **Gestión**: Puede posponer (re-agendar) o cancelar sus citas existentes.
- **Perfil**:
    - Puede ver y actualizar su información personal (nombre, apellido).
    - Puede acceder y editar las respuestas de su formulario de salud en cualquier momento a través de la misma interfaz de pasos del registro inicial.
- **Notificaciones**: Recibe notificaciones en un menú desplegable (`DropdownMenu`) cuando un moderador elimina uno de sus contenidos.

---

## 2. Profesional (Rol 1)

El profesional es el creador de contenido y el experto que guía a los usuarios. Tiene permisos elevados para gestionar el contenido de la plataforma.

### 2.1. Panel de Control (Dashboard)
- Visualiza estadísticas clave: número total de recetas, rutinas y citas pendientes.
- Tiene "Acciones Rápidas" (botones) para navegar directamente a las secciones de gestión de contenido.

### 2.2. Gestión de Contenido
- **Recetas**:
    - **Vista de Gestión**: Igual que el cliente, pero con filtros para ver contenido "visible", "oculto" o "todo". Las recetas ocultas tienen una distinción visual.
    - **Crear/Editar**: A través de un modal (`RecipeFormModal`), puede gestionar los siguientes campos:
        - `Título` (texto)
        - `Descripción` (texto largo)
        - `Categoría` (texto)
        - `Ingredientes` (texto largo)
        - `Instrucciones` (texto largo, con formato)
        - `Imagen` (subida de archivo)
        - `Visible` (interruptor on/off)
    - **Acciones**: Puede **crear, editar y eliminar** cualquier receta.
- **Rutinas**:
    - **Vista de Gestión**: Un gestor con pestañas para "Casa" y "Gimnasio". Dentro de cada pestaña, puede filtrar por visibilidad.
    - **Crear/Editar**: A través de un modal (`RoutineFormModal`), puede gestionar:
        - `Título` (texto)
        - `Descripción` (texto largo)
        - `Equipo` (texto largo)
        - `Ejercicios` (texto largo)
        - `Visible` (interruptor on/off)
        - El `Entorno` (`casa`/`gimnasio`) se asigna automáticamente según la pestaña activa.
    - **Acciones**: Puede **crear, editar y eliminar** cualquier rutina en ambos entornos.
- **Clases en Vivo**:
    - **Crear/Editar**: A través de un modal (`LiveSessionFormModal`), puede gestionar:
        - `Título` (texto)
        - `Descripción` (texto largo)
        - `Enlace del Directo` (URL de YouTube)
        - `Fecha y Hora` del evento
        - `Miniatura` (subida de imagen)
    - **Acciones**: Puede **crear, programar, editar y eliminar** clases en vivo.
- **Comunidad - Anuncios**:
    - **Crear Anuncio**: Es el único rol que puede crear anuncios, que consisten en un **mensaje** (texto) y una **imagen** opcional.
    - **Acciones**: Puede **editar y eliminar** cualquier anuncio.

### 2.3. Interacción con Usuarios
- **Comunidad - Pregúntale a un Profesional**:
    - Puede ver todas las preguntas de los usuarios.
    - Puede publicar respuestas a cualquier pregunta, las cuales se destacan visualmente como respuesta de un profesional.
- **Clínica de la Técnica**:
    - Puede ver todos los videos subidos por los usuarios.
    - Puede publicar respuestas de feedback en cualquier video, las cuales se destacan visualmente.
- **Gestión de Citas**:
    - **Vista**: Ve una lista de todas las citas agendadas por los usuarios en una tabla (`Table`).
    - **Filtros**: Puede filtrar las citas por día usando un selector de calendario (`Calendar`).
    - **Acciones**: Puede **confirmar** o **cancelar** las citas de los usuarios.

### 2.4. Restricciones
- No puede modificar perfiles de usuario.
- No participa en las funciones de moderación de la comunidad (eliminar contenido de otros usuarios).
- No tiene acceso a las herramientas de moderación.

---

## 3. Moderador (Rol 2)

El moderador se encarga de mantener el orden y la seguridad en la plataforma. Tiene permisos para ver todo el contenido y gestionar a los usuarios.

### 3.1. Panel de Control (Dashboard)
- Visualiza estadísticas de moderación: número total de usuarios regulares y acciones de moderación del día.
- Tiene acceso directo a las "Herramientas de Moderación".

### 3.2. Herramientas de Moderación
- **Gestionar Usuarios**:
    - **Vista**: Una interfaz con pestañas para listar a los **Usuarios**, **Profesionales** y **Moderadores** en tablas separadas.
    - **Información Visible**: Nombre, apellido, correo, fecha de ingreso y, para usuarios regulares, su **entorno de entrenamiento**.
    - **Acciones**: Puede **editar el entorno de entrenamiento** (`casa` o `gimnasio`) de los usuarios con rol 0.
- **Gestionar Registros**:
    - **Vista**: Dos tarjetas (`Card`), una para el enlace de Profesionales y otra para Moderadores.
    - **Acciones**: Puede **activar o desactivar** los enlaces de registro especiales para nuevos Profesionales y Moderadores usando un interruptor (`Switch`).
    - **Historial**: Ve un historial en tablas (`Table`) de todos los usuarios registrados con roles especiales.
- **Historial de Moderación**:
    - **Vista**: Ve un registro inmutable en una tabla (`Table`) de todas las acciones de moderación realizadas en la plataforma (quién eliminó qué, cuándo y por qué).

### 3.3. Acciones de Moderación en la Comunidad
- **Comunidad (Feed y Preguntas)** y **Clínica de Técnica**:
    - **Acceso**: Puede ver todo el contenido (publicaciones, preguntas, videos, respuestas).
    - **Acciones**: Puede **eliminar cualquier publicación, pregunta, video o respuesta** creada por un usuario regular (rol 0).
    - **Proceso de Eliminación**: Al eliminar, se abre un modal (`ModerationActionDialog`) donde debe proporcionar una **razón** (texto). Esta acción queda registrada en el historial y notifica al usuario afectado.

### 3.4. Restricciones
- **No puede** editar el contenido de los usuarios (solo eliminar).
- **No puede** crear contenido en nombre de los usuarios o profesionales (recetas, rutinas, anuncios).
- **No puede** gestionar citas.
- **No puede** modificar el rol de los usuarios.
