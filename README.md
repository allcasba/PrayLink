# FaithCircle - Red Social Espiritual

Esta es una aplicación moderna de red social para comunidades de fe, construida con React, TypeScript, Tailwind CSS y Google Gemini AI.

## 🚀 Inicio Rápido

### 1. Requisitos Previos
Instala [Node.js LTS](https://nodejs.org/). Esto instalará automáticamente `npm`.

### 2. Instalación
Dentro de la carpeta del proyecto, ejecuta:
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (puedes copiar el contenido de `.env.example`):
- `VITE_SUPABASE_URL`: Tu URL de proyecto en Supabase.
- `VITE_SUPABASE_KEY`: Tu clave pública (anon) de Supabase.
- `API_KEY`: Tu clave de Google Gemini API.

### 4. Desarrollo
Para ejecutar la aplicación en tu computadora:
```bash
npm run dev
```

### 5. Producción
Para crear la versión que se sube al servidor:
```bash
npm run build
```
Esto generará una carpeta `dist/`. El contenido de esa carpeta es lo que realmente vive en el servidor.

## ☁️ Despliegue (Hosting)

### Opción Recomendada: Vercel (Gratis y Fácil)
1. Sube tu código a un repositorio en **GitHub**.
2. Conecta tu cuenta de GitHub en [Vercel.com](https://vercel.com).
3. Selecciona el repositorio de FaithCircle.
4. Añade las variables de entorno en la configuración de Vercel.
5. ¡Listo! Vercel te dará una URL `.vercel.app`.

### Usando GoDaddy (Solo Dominio)
Si compraste un dominio en GoDaddy (ej. `www.faithcircle.com`):
1. En el panel de Vercel, ve a **Settings > Domains**.
2. Escribe tu dominio.
3. Vercel te dará unos registros DNS (A y CNAME).
4. Ve a GoDaddy y cámbialos en la sección de DNS de tu dominio.

## 🛠️ Tecnologías Usadas
- **Frontend:** React + Vite
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **IA:** Google Generative AI (Gemini 3 Flash)
- **Backend:** Supabase (PostgreSQL + Auth)