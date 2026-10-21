/**
 * prepare-data (capa: scripts) — puente Excel → Cucumber.
 *
 * 1. Lee y valida el Excel (hoja, fila y columna en los mensajes).
 * 2. Aplica filtros recibidos por variables de entorno desde el .bat:
 *      E2E_FILTER_CASE (TestCaseId), E2E_FILTER_ROW (IdFila), E2E_FILTER_TAG (tags Cucumber).
 * 3. Genera .run/rows.json, .run/run.json y copias de los features en .run/features/
 *    con un bloque `Ejemplos:` por fila habilitada (tag @fila:<IdFila>).
 *
 * Si hay errores, se imprimen todos juntos y el proceso termina con código 1
 * (el .bat no abre el navegador).
 */
import * as fs from 'fs';
import * as path from 'path';
import { RUTAS } from '../src/config/config';
import { COLUMNAS_COMUNES, leerLibro } from '../src/controller/excel-reader';
import {
  generarFeature,
  leerBloqueExcel,
  leerTestCaseId,
} from '../src/controller/feature-generator';
import type { FilaDatos, InfoCorrida } from '../src/models';
import { CASOS } from '../src/registry/casos';

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

function idCorrida(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}_${dosDigitos(d.getHours())}-${dosDigitos(d.getMinutes())}-${dosDigitos(d.getSeconds())}`;
}

async function main(): Promise<void> {
  const errores: string[] = [];
  const filtroCaso = (process.env.E2E_FILTER_CASE ?? '').trim();
  const filtroFila = (process.env.E2E_FILTER_ROW ?? '').trim();
  const filtroTag = (process.env.E2E_FILTER_TAG ?? '').trim();

  // Filtros: se validan para no aceptar texto inseguro.
  if (filtroCaso && !CASOS.some((c) => c.id === filtroCaso)) {
    errores.push(
      `El caso "${filtroCaso}" no existe. Casos disponibles: ${CASOS.map((c) => c.id).join(', ')}.`,
    );
  }
  if (filtroFila && !/^[A-Za-z0-9_-]+$/.test(filtroFila)) {
    errores.push(`El IdFila "${filtroFila}" tiene caracteres no permitidos.`);
  }
  if (filtroTag && !/^[@A-Za-z0-9_:\-\s()]+$/.test(filtroTag)) {
    errores.push(`El tag "${filtroTag}" tiene caracteres no permitidos.`);
  }

  if (!fs.existsSync(RUTAS.excel)) {
    errores.push(`No se encontró el Excel de datos en ${RUTAS.excel}. Ejecute "npm run plantilla".`);
    return terminarConErrores(errores);
  }
  const hojas = await leerLibro(RUTAS.excel);

  // Hojas sin caso registrado.
  for (const h of hojas) {
    if (h.nombre === 'Instrucciones') continue;
    if (!CASOS.some((c) => c.id === h.nombre)) {
      errores.push(`La hoja "${h.nombre}" no corresponde a ningún caso con feature. Elimínela o renómbrela.`);
    }
  }

  const todasLasFilas: Record<string, FilaDatos> = {};
  const idsVistos = new Set<string>();
  const generados: Array<{ origen: string; contenido: string }> = [];

  for (const caso of CASOS) {
    if (!fs.existsSync(caso.feature)) {
      errores.push(`No se encontró el feature del caso ${caso.id}: ${caso.feature}.`);
      continue;
    }
    const contenido = fs.readFileSync(caso.feature, 'utf8');
    const idEnFeature = leerTestCaseId(contenido);
    if (idEnFeature !== caso.id) {
      errores.push(`El feature ${caso.feature} debe tener el tag @${caso.id} (tiene ${idEnFeature ?? 'ninguno'}).`);
    }
    const bloque = leerBloqueExcel(contenido.split(/\r?\n/));
    if (!bloque) {
      errores.push(`El feature ${caso.feature} no tiene un bloque "@excel Ejemplos:" con tabla.`);
      continue;
    }
    const hoja = hojas.find((h) => h.nombre === caso.id);
    if (!hoja) {
      errores.push(`El caso ${caso.id} no tiene hoja en el Excel. Cree una hoja llamada "${caso.id}".`);
      continue;
    }

    // Columnas requeridas: comunes + las del <parámetro> del Esquema del escenario.
    const requeridas = [...new Set([...COLUMNAS_COMUNES, ...bloque.encabezados])];
    for (const col of requeridas) {
      if (!hoja.encabezados.includes(col)) {
        errores.push(`Hoja "${hoja.nombre}": falta la columna "${col}" (fila 1).`);
      }
    }
    if (requeridas.some((c) => !hoja.encabezados.includes(c))) continue;

    const habilitadas: Array<Record<string, string>> = [];
    for (const fila of hoja.filas) {
      const d = fila.datos;
      const donde = `Hoja "${hoja.nombre}", fila ${fila.numeroFila}`;
      const ejecutar = d.Ejecutar.toUpperCase();
      if (ejecutar !== 'SI' && ejecutar !== 'NO') {
        errores.push(`${donde}, columna "Ejecutar": use SI o NO (tiene "${d.Ejecutar}").`);
        continue;
      }
      if (!d.IdFila) {
        errores.push(`${donde}, columna "IdFila": no puede estar vacía.`);
        continue;
      }
      if (!new RegExp(`^${caso.id}-\\d+$`).test(d.IdFila)) {
        errores.push(`${donde}, columna "IdFila": debe tener el formato ${caso.id}-01 (tiene "${d.IdFila}").`);
        continue;
      }
      if (idsVistos.has(d.IdFila)) {
        errores.push(`${donde}, columna "IdFila": "${d.IdFila}" está duplicado.`);
        continue;
      }
      idsVistos.add(d.IdFila);

      // Los parámetros del Esquema no pueden venir vacíos (las longitudes son números enteros).
      let valida = true;
      for (const col of bloque.encabezados) {
        if (!d[col]) {
          errores.push(`${donde}, columna "${col}": no puede estar vacía.`);
          valida = false;
        } else if (/^(Long|Tamano)/.test(col) && !/^\d+$/.test(d[col])) {
          errores.push(`${donde}, columna "${col}": debe ser un número entero (tiene "${d[col]}").`);
          valida = false;
        }
      }
      if (!valida || ejecutar === 'NO') continue;

      // Filtros por caso y por fila.
      if (filtroCaso && caso.id !== filtroCaso) continue;
      if (filtroFila && d.IdFila !== filtroFila) continue;
      habilitadas.push(d);
      todasLasFilas[d.IdFila] = d;
    }
    if (habilitadas.length > 0) {
      generados.push({ origen: caso.feature, contenido: generarFeature(contenido, habilitadas) });
    }
  }

  if (filtroFila && !todasLasFilas[filtroFila] && errores.length === 0) {
    errores.push(`La fila "${filtroFila}" no existe, no está habilitada o no pertenece al caso filtrado.`);
  }
  if (errores.length === 0 && generados.length === 0) {
    errores.push('No hay filas habilitadas (Ejecutar = SI) para los filtros indicados.');
  }
  if (errores.length > 0) return terminarConErrores(errores);

  // Salidas: se recrea .run/ en cada corrida.
  fs.rmSync(RUTAS.run, { recursive: true, force: true });
  fs.mkdirSync(RUTAS.featuresGenerados, { recursive: true });
  for (const g of generados) {
    fs.writeFileSync(path.join(RUTAS.featuresGenerados, path.basename(g.origen)), g.contenido, 'utf8');
  }
  fs.writeFileSync(RUTAS.rows, JSON.stringify(todasLasFilas, null, 2), 'utf8');

  const runId = idCorrida();
  const info: InfoCorrida = {
    runId,
    reportDir: path.posix.join(RUTAS.reportes, runId),
    tags: filtroTag ? `(${filtroTag}) and not @wip` : 'not @wip',
  };
  fs.mkdirSync(info.reportDir, { recursive: true });
  fs.writeFileSync(RUTAS.runInfo, JSON.stringify(info, null, 2), 'utf8');

  console.log(`Datos validados: ${Object.keys(todasLasFilas).length} fila(s) a ejecutar.`);
  console.log(`Reporte de esta corrida: ${info.reportDir}`);
}

function terminarConErrores(errores: string[]): void {
  console.error('\nNo se puede ejecutar. Corrija lo siguiente en el Excel/configuración:');
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(`Error inesperado al preparar los datos: ${(e as Error).message}`);
  process.exit(1);
});
