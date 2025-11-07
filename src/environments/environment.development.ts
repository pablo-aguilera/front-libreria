export const environment = {
  production: false,
  // Tu backend local (ajústalo si cambias el puerto o despliegas)
  apiBase: 'https://backet-libreria.onrender.com/api',
  // Alias para compatibilidad con servicios que usan apiUrl
  get apiUrl() { return this.apiBase; }
};
