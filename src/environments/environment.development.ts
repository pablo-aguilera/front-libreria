export const environment = {
  production: false,
  // Tu backend local (ajústalo si cambias el puerto o despliegas)
  apiBase: 'https://render.com/docs/web-services#port-binding/api',
  // Alias para compatibilidad con servicios que usan apiUrl
  get apiUrl() { return this.apiBase; }
};
