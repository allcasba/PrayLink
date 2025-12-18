
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Esto asegura que 'process.env' exista durante la ejecución en el navegador
    'process.env': process.env
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    sourcemap: false
  }
});
