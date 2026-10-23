/**
 * report (capa: scripts) — post-proceso de la corrida.
 *
 * Lee los `fila.json` que escribe el hook After en
 * reports/<corrida>/evidencias/<TestCaseId>/<IdFila>/ y genera:
 *   - reports/<corrida>/resultados.xlsx (una fila por IdFila ejecutado)
 *   - resumen en consola: total, pasados, fallidos y omitidos.
 * El código de salida es siempre 0: el estado de la prueba lo conserva el .bat.
 */
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { RUTAS } from '../src/config/config';
import type { InfoCorrida, ResultadoFila } from '../src/models';

function recolectar(dir: string, acumulado: ResultadoFila[]): void {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) recolectar(ruta, acumulado);
    else if (e.name === 'fila.json') acumulado.push(JSON.parse(fs.readFileSync(ruta, 'utf8')));
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(RUTAS.runInfo)) {
    console.log('No hay una corrida preparada; no se genera resultados.xlsx.');
    return;
  }
  const info = JSON.parse(fs.readFileSync(RUTAS.runInfo, 'utf8')) as InfoCorrida;
  const filas: ResultadoFila[] = [];
  recolectar(path.join(info.reportDir, 'evidencias'), filas);
  filas.sort((a, b) => a.idFila.localeCompare(b.idFila));

  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Resultados');
  hoja.columns = [
    { header: 'TestCaseId', key: 'testCaseId', width: 14 },
    { header: 'IdFila', key: 'idFila', width: 16 },
    { header: 'Escenario', key: 'escenario', width: 50 },
    { header: 'Datos usados', key: 'datos', width: 50 },
    { header: 'Estado', key: 'estado', width: 12 },
    { header: 'Paso que falló', key: 'pasoFallido', width: 50 },
    { header: 'Inicio', key: 'inicio', width: 22 },
    { header: 'Fin', key: 'fin', width: 22 },
    { header: 'Duración (s)', key: 'duracionSeg', width: 13 },
    { header: 'Error resumido', key: 'error', width: 60 },
    { header: 'Trace', key: 'trace', width: 60 },
    { header: 'Video', key: 'video', width: 60 },
    { header: 'Screenshots', key: 'screenshots', width: 60 },
    { header: 'Notas', key: 'notas', width: 50 },
  ];
  hoja.getRow(1).font = { bold: true };
  for (const f of filas) {
    const fila = hoja.addRow({
      ...f,
      datos: Object.entries(f.datos)
        .filter(([k]) => k !== 'Ejecutar')
        .map(([k, v]) => `${k}=${v}`)
        .join('; '),
      screenshots: f.screenshots.join('\n'),
    });
    const color = f.estado === 'PASÓ' ? 'FFC6EFCE' : f.estado === 'FALLÓ' ? 'FFFFC7CE' : 'FFFFEB9C';
    fila.getCell('estado').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  }
  const salida = path.join(info.reportDir, 'resultados.xlsx');
  await libro.xlsx.writeFile(salida);

  const cuenta = (e: string) => filas.filter((f) => f.estado === e).length;
  console.log('\n================ RESUMEN ================');
  console.log(`Total: ${filas.length}   Pasados: ${cuenta('PASÓ')}   Fallidos: ${cuenta('FALLÓ')}   Omitidos: ${cuenta('OMITIDO')}`);
  console.log(`Resultados: ${salida}`);
  console.log(`Reporte HTML: ${path.join(info.reportDir, 'cucumber-report.html')}`);
  console.log('=========================================');
}

main().catch((e) => {
  console.error(`No se pudo generar resultados.xlsx: ${(e as Error).message}`);
});
