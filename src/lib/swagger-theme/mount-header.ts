/** Script client injecté dans Swagger UI : charge header.html et l’affiche. */
export function buildMountHeaderScript(): string {
  return `
(() => {
  const HEADER_URL = '/static/theme/header.html';

  async function mountHeader() {
    if (document.getElementById('f95-api-header')) return;

    const response = await fetch(HEADER_URL);
    if (!response.ok) return;

    document.body.classList.add('swagger-body');

    const header = document.createElement('header');
    header.id = 'f95-api-header';
    header.innerHTML = await response.text();

    const swagger = document.getElementById('swagger-ui');
    if (swagger) {
      document.body.insertBefore(header, swagger);
    } else {
      document.body.prepend(header);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void mountHeader();
    });
  } else {
    void mountHeader();
  }
})();
`.trim();
}
