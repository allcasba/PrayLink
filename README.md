
# PrayLink - Red Global de Fe

Plataforma de conexión espiritual con IA y sistema de ofrendas integrado.

## 🛠️ Configuración de Pagos

Para que el sistema de pagos funcione, debes añadir estas variables de entorno en tu panel de control de hosting (Vercel, etc.):

1.  `VITE_STRIPE_PUBLISHABLE_KEY`: Tu clave pública de Stripe (`pk_live_...` o `pk_test_...`).
2.  `VITE_PAYPAL_CLIENT_ID`: Tu ID de cliente de PayPal Developer.
3.  `API_KEY`: Tu clave de Google Gemini para las funciones de IA.

## 🚀 Despliegue en 3 pasos
1. Sube este código a un repositorio de GitHub.
2. Conecta Vercel a ese repositorio.
3. Configura las variables mencionadas arriba en la sección **Environment Variables**.

## ⚖️ Aviso Legal
Esta aplicación maneja datos sensibles (religión). Se recomienda habilitar HTTPS y cumplir con la normativa local de protección de datos.
