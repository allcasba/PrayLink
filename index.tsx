
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("PrayLink: Iniciando montaje de la aplicación...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("PrayLink: No se encontró el elemento #root en el DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("PrayLink: Aplicación montada exitosamente.");
  } catch (error) {
    console.error("PrayLink: Error fatal durante el montaje:", error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
      <h2>Error al cargar la aplicación</h2>
      <p>${error instanceof Error ? error.message : 'Error desconocido'}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">Reintentar</button>
    </div>`;
  }
}
