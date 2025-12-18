# Guía de Despliegue a Producción - FaithCircle

Este documento explica cómo llevar **FaithCircle** de un prototipo a una aplicación real en la nube.

## 1. Requisitos Previos
*   Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
*   Una cuenta en [GitHub](https://github.com/).
*   Una cuenta en [Supabase](https://supabase.com/).
*   Una cuenta en [Vercel](https://vercel.com/) (Recomendado para el hosting frontend).

## 2. Preparación de la Base de Datos (Supabase)
1.  Crea un nuevo proyecto en Supabase.
2.  Ve al **SQL Editor** y ejecuta el script proporcionado en los comentarios de `services/mockBackend.ts` para crear las tablas `profiles`, `posts` y `comments`.
3.  Habilita la autenticación por correo electrónico en **Authentication -> Providers**.

## 3. Configuración Local
1.  Crea una carpeta llamada `faithcircle` en tu PC.
2.  Coloca todos los archivos del proyecto allí (App.tsx, index.tsx, package.json, etc.).
3.  Crea un archivo llamado `.env` en la raíz y añade:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_KEY=tu_anon_key_de_supabase
    API_KEY=tu_gemini_api_key
    ```
4.  Instala las dependencias: `npm install`.

## 4. Despliegue en Vercel
1.  Sube tu código a un repositorio privado en GitHub.
2.  En Vercel, importa el proyecto desde GitHub.
3.  En la configuración del despliegue, añade las mismas variables de entorno del paso anterior (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `API_KEY`).
4.  Haz clic en **Deploy**. Vercel te dará una URL (ej: `faithcircle.vercel.app`).

## 5. Dominio Profesional (GoDaddy)
1.  Compra tu dominio en GoDaddy.
2.  En Vercel, ve a **Settings -> Domains** y añade tu dominio.
3.  Sigue las instrucciones de Vercel para cambiar los DNS en tu panel de GoDaddy (normalmente un registro A y un CNAME).

---
**Nota Legal:** Al manejar datos de religión y nacionalidad, asegúrate de cumplir con las leyes de protección de datos (GDPR/CCPA) de tu región.