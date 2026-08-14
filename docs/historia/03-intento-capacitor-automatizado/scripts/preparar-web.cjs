const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const www = path.join(root, 'www');
const vendor = path.join(www, 'vendor');

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

function copyFile(source, destination) {
  if (!fs.existsSync(source)) {
    fail(`No se encontró la dependencia esperada: ${source}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    fail(`No se encontró la carpeta esperada: ${source}`);
  }
  fs.cpSync(source, destination, { recursive: true });
}

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(vendor, { recursive: true });

copyFile(path.join(src, 'index.html'), path.join(www, 'index.html'));

copyFile(
  path.join(root, 'node_modules', 'react', 'umd', 'react.production.min.js'),
  path.join(vendor, 'react.production.min.js')
);
copyFile(
  path.join(root, 'node_modules', 'react-dom', 'umd', 'react-dom.production.min.js'),
  path.join(vendor, 'react-dom.production.min.js')
);
copyFile(
  path.join(root, 'node_modules', '@babel', 'standalone', 'babel.min.js'),
  path.join(vendor, 'babel.min.js')
);

const interRoot = path.join(root, 'node_modules', '@fontsource', 'inter');
const interOut = path.join(vendor, 'inter');
fs.mkdirSync(interOut, { recursive: true });

for (const weight of ['400', '600', '700', '800']) {
  copyFile(
    path.join(interRoot, `${weight}.css`),
    path.join(interOut, `${weight}.css`)
  );
}
copyDirectory(path.join(interRoot, 'files'), path.join(interOut, 'files'));

const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');

if (html.includes('https://localhost') || html.includes('http://localhost')) {
  fail('El HTML todavía contiene una dirección localhost.');
}

const remoteRuntimePatterns = [
  'cdn.tailwindcss.com',
  'unpkg.com/react',
  'unpkg.com/@babel',
  'cdn.jsdelivr.net/npm/@fontsource'
];

for (const pattern of remoteRuntimePatterns) {
  if (html.includes(pattern)) {
    fail(`Quedó una dependencia externa sin convertir: ${pattern}`);
  }
}

console.log('Archivos web locales preparados correctamente.');
