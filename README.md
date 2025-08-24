# Marivi Power - Plataforma de Bienestar

Esta es una aplicación web full-stack construida con Next.js, diseñada como una plataforma de bienestar integral que conecta a usuarios con profesionales de la salud, moderadores y una comunidad de apoyo.

## Stack Tecnológico

- **Framework Principal**: [Next.js](https://nextjs.org/) (con App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [React](https://react.dev/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend y Base de Datos**: [Supabase](https://supabase.com/) (Autenticación, Base de Datos PostgreSQL, Storage)
- **Funcionalidades de IA**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación.

---

## Primeros Pasos

Para levantar el entorno de desarrollo localmente, sigue estos pasos.

### 1. Prerrequisitos

- [Node.js](https://nodejs.org/en) (versión 20.x o superior recomendada)
- `npm` o un gestor de paquetes compatible.

### 2. Instalación

Clona el repositorio e instala las dependencias:

```bash
npm install
```

### 3. Variables de Entorno

Para que la aplicación se conecte correctamente con Supabase, necesitas configurar tus credenciales.

1.  Crea un archivo llamado `.env.local` en la raíz del proyecto.
2.  Añade las siguientes variables con los valores de tu proyecto de Supabase (los puedes encontrar en `Project Settings > API` en tu panel de Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=TU_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

**Importante**: El archivo `.env.local` no debe ser versionado en el control de fuentes (ya está incluido en `.gitignore`).

---

## Scripts Disponibles

Puedes ejecutar los siguientes comandos desde la raíz del proyecto:

### `npm run dev`

Inicia el servidor de desarrollo de Next.js en modo "turbopack" para un rendimiento óptimo.
- **Puerto**: `9002`
- La aplicación se recargará automáticamente al guardar cambios.

### `npm run build`

Compila la aplicación para producción. Este comando genera una versión optimizada de tu aplicación en el directorio `.next`.

### `npm run start`

Inicia un servidor de producción con la versión compilada de la aplicación.
- **Puerto por defecto**: `9002` (o el especificado en la variable de entorno `PORT`).
- Debes ejecutar `npm run build` antes de poder usar este comando.

### `npm run genkit:dev`

Inicia el servidor de desarrollo de Genkit para probar los flujos de IA localmente.

### `npm run lint`

Ejecuta el linter de Next.js (`eslint`) para analizar el código en busca de errores y problemas de estilo.

### `npm run typecheck`

Ejecuta el compilador de TypeScript (`tsc`) para verificar que no haya errores de tipado en el proyecto.
