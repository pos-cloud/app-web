/**
 * Copia TinyMCE desde node_modules a src/assets/tinymce para que ng serve
 * lo sirva con el MIME correcto (evita fallback a index.html con /tinymce/...).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'node_modules', 'tinymce');
const destDir = path.join(root, 'src', 'assets', 'tinymce');

if (!fs.existsSync(srcDir)) {
  console.warn('[copy-tinymce] node_modules/tinymce no existe; ejecutá npm install.');
  process.exit(0);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.cpSync(srcDir, destDir, { recursive: true });
console.log('[copy-tinymce] Copiado a src/assets/tinymce');
