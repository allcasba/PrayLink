
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures that 'process.env' exists during browser execution
    'process.env': {
      ...process.env,
      API_KEY: process.env.API_KEY,
      VITE_PAYPAL_CLIENT_ID: process.env.VITE_PAYPAL_CLIENT_ID,
      VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_KEY: process.env.VITE_SUPABASE_KEY,
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      // Mark dependencies as external so Rollup doesn't try to bundle them.
      // They will be resolved at runtime via the importmap in index.html.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lucide-react',
        '@supabase/supabase-js',
        '@google/genai',
        '@paypal/react-paypal-js',
        '@stripe/stripe-js',
        '@stripe/react-stripe-js'
      ],
    }
  }
});
