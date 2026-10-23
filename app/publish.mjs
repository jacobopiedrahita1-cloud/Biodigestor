// Copia la versión compilada (dist/) a la raíz del repositorio, que es lo que sirve GitHub Pages
// en modo "Deploy from a branch". Uso: npm run publish
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
for (const p of ['index.html', 'assets']) if (existsSync(new URL(p, root))) rmSync(new URL(p, root), { recursive: true });
cpSync(new URL('dist/', import.meta.url), root, { recursive: true });
writeFileSync(new URL('.nojekyll', root), '');
console.log('Sitio copiado a la raíz del repositorio.');
