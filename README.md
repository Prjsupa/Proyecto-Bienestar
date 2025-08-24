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

## Variables de Entorno

Para que la aplicación se conecte correctamente con Supabase, es necesario un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

- `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anónima (public) de tu proyecto de Supabase.

---

## Scripts Disponibles

Los siguientes comandos se ejecutan desde la raíz del proyecto:

### `npm run dev`

- **Función**: Inicia el servidor de desarrollo de Next.js en modo "turbopack".
- **Puerto**: `9002`
- **Descripción**: Utilizado para el desarrollo local con recarga automática al guardar cambios.

### `npm run build`

- **Función**: Compila la aplicación para producción.
- **Descripción**: Genera una versión optimizada de la aplicación en el directorio `.next`.

### `npm run start`

- **Función**: Inicia un servidor de producción con la versión compilada.
- **Puerto por defecto**: `9002` (o el especificado en la variable de entorno `PORT`).
- **Requisito**: Debes ejecutar `npm run build` antes de usar este comando.

### `npm run genkit:dev`

- **Función**: Inicia el servidor de desarrollo de Genkit para probar los flujos de IA localmente.

### `npm run lint`

- **Función**: Ejecuta el linter de Next.js (`eslint`) para analizar el código en busca de errores y problemas de estilo.

### `npm run typecheck`

- **Función**: Ejecuta el compilador de TypeScript (`tsc`) para verificar que no haya errores de tipado en el proyecto.
