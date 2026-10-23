/**
 * create-template (capa: scripts) — genera data/input/datos_pruebas.xlsx.
 *
 * Una hoja por caso registrado (nombre = TestCaseId) con las columnas comunes
 * (Ejecutar, IdFila, Descripcion) + las columnas del `@excel Ejemplos:` del feature,
 * con filas de ejemplo ficticias y lista desplegable SI/NO. Más una hoja
 * "Instrucciones". Si el Excel ya existe NO se sobrescribe (use --force para recrearlo).
 */
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { RUTAS } from '../src/config/config';
import { leerBloqueExcel } from '../src/controller/feature-generator';
import { CASOS } from '../src/registry/casos';

async function main(): Promise<void> {
  if (fs.existsSync(RUTAS.excel) && !process.argv.includes('--force')) {
    console.log(`Ya existe ${RUTAS.excel}; no se sobrescribe (use --force para recrearlo).`);
    return;
  }
  const libro = new ExcelJS.Workbook();

  const ins = libro.addWorksheet('Instrucciones');
  ins.columns = [{ width: 24 }, { width: 100 }];
  const textos: Array<[string, string]> = [
    ['Cómo usar este archivo', 'Cada hoja es un caso de prueba (el nombre de la hoja es el TestCaseId). Cada fila habilitada es una ejecución independiente.'],
    ['Ejecutar', 'Lista desplegable SI/NO. Solo las filas con SI se ejecutan.'],
    ['IdFila', 'Identificador único de la fila con el formato <TestCaseId>-NN. Ejemplo: CP-ADM-001-01.'],
    ['Descripcion', 'Propósito de la iteración, en texto libre.'],
    ['LongTitulo / LongDescripcion / LongNota', 'Cantidad de caracteres (número entero) del Job Title, Job Description y Note. El texto se genera automáticamente con esa longitud exacta. 0 = no se llena el campo opcional.'],
    ['Seguridad', 'Este archivo NUNCA debe contener usuarios ni contraseñas. Las credenciales están en el archivo .env.'],
    ['Agregar filas', 'Copie una fila existente, cambie el IdFila (siguiente número) y los datos. No modifique los encabezados de la fila 1.'],
  ];
  textos.forEach(([a, b], i) => {
    ins.getCell(i + 1, 1).value = a;
    ins.getCell(i + 1, 1).font = { bold: true };
    ins.getCell(i + 1, 2).value = b;
    ins.getCell(i + 1, 2).alignment = { wrapText: true, vertical: 'top' };
  });

  for (const caso of CASOS) {
    const bloque = leerBloqueExcel(fs.readFileSync(caso.feature, 'utf8').split(/\r?\n/));
    if (!bloque) throw new Error(`El feature ${caso.feature} no tiene bloque @excel.`);
    const encabezados = ['Ejecutar', 'IdFila', 'Descripcion', ...bloque.encabezados.filter((h) => h !== 'IdFila')];
    const hoja = libro.addWorksheet(caso.id);
    hoja.addRow(encabezados);
    hoja.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hoja.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    hoja.views = [{ state: 'frozen', ySplit: 1 }];
    encabezados.forEach((h, i) => {
      hoja.getColumn(i + 1).width = h === 'Descripcion' ? 48 : 18;
    });
    for (const ejemplo of bloque.filasEjemplo) {
      const porColumna: Record<string, string> = {};
      bloque.encabezados.forEach((h, i) => (porColumna[h] = ejemplo[i]));
      const datos = encabezados.map((h) => {
        if (h === 'Ejecutar') return 'SI';
        if (h === 'Descripcion') {
          return `Datos: ${bloque.encabezados.filter((c) => c !== 'IdFila').map((c) => `${c}=${porColumna[c]}`).join(', ')}`;
        }
        const v = porColumna[h] ?? '';
        return /^\d+$/.test(v) && /^Long/.test(h) ? Number(v) : v;
      });
      hoja.addRow(datos);
    }
    // Lista desplegable SI/NO en la columna A (filas 2..500).
    for (let r = 2; r <= 500; r++) {
      hoja.getCell(r, 1).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"SI,NO"'],
        showErrorMessage: true,
        errorTitle: 'Valor no válido',
        error: 'Use SI o NO.',
      };
    }
  }

  fs.mkdirSync(path.dirname(RUTAS.excel), { recursive: true });
  await libro.xlsx.writeFile(RUTAS.excel);
  console.log(`Plantilla creada: ${RUTAS.excel}`);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
