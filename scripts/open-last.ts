/**
 * open-last (capa: scripts) — abre resultados de la última corrida (lo usa el .bat).
 *
 * Uso: npm run abrir -- html | evidencias | trace
 * Para `trace` se lee el IdFila de la variable de entorno E2E_TRACE_ROW
 * (nunca como parámetro de línea de comandos).
 */
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { RUTAS } from '../src/config/config';

function ultimaCorrida(): string | null {
  if (!fs.existsSync(RUTAS.reportes)) return null;
  const dirs = fs
    .readdirSync(RUTAS.reportes, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  return dirs.length ? path.resolve(RUTAS.reportes, dirs[dirs.length - 1]) : null;
}

function abrir(ruta: string): void {
  const comando =
    process.platform === 'win32' ? `start "" "${ruta}"` : process.platform === 'darwin' ? `open "${ruta}"` : `xdg-open "${ruta}"`;
  exec(comando);
}

function buscarTrace(dir: string, idFila: string): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === idFila && fs.existsSync(path.join(ruta, 'trace.zip'))) return path.join(ruta, 'trace.zip');
      const r = buscarTrace(ruta, idFila);
      if (r) return r;
    }
  }
  return null;
}

const modo = process.argv[2];
const corrida = ultimaCorrida();
if (!corrida) {
  console.error('Aún no hay reportes. Ejecute las pruebas primero.');
  process.exit(1);
}

if (modo === 'html') {
  const html = path.join(corrida, 'cucumber-report.html');
  if (!fs.existsSync(html)) {
    console.error(`No existe ${html}.`);
    process.exit(1);
  }
  abrir(html);
} else if (modo === 'evidencias') {
  abrir(path.join(corrida, 'evidencias'));
} else if (modo === 'trace') {
  const id = (process.env.E2E_TRACE_ROW ?? '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    console.error('IdFila no válido.');
    process.exit(1);
  }
  const zip = buscarTrace(path.join(corrida, 'evidencias'), id);
  if (!zip) {
    console.error(`No se encontró el trace de la fila ${id} en la última corrida.`);
    process.exit(1);
  }
  spawn('npx', ['playwright', 'show-trace', zip], { stdio: 'inherit', shell: true });
} else {
  console.error('Use: html | evidencias | trace');
  process.exit(1);
}
