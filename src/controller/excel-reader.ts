/**
 * Lectura y validación del Excel (capa: controller).
 *
 * Lee `data/input/datos_pruebas.xlsx` con exceljs y valida su estructura ANTES de
 * abrir el navegador. Los mensajes indican hoja, fila y columna en lenguaje claro.
 * El archivo de entrada nunca se modifica.
 */
import ExcelJS from 'exceljs';
import type { FilaDatos } from '../models';

/** Columnas comunes obligatorias de cada hoja. */
export const COLUMNAS_COMUNES = ['Ejecutar', 'IdFila', 'Descripcion'] as const;

/** Fila leída de una hoja. */
export interface FilaLeida {
  /** Número de fila en Excel (para mensajes de error). */
  numeroFila: number;
  datos: FilaDatos;
}

/** Hoja leída: encabezados + filas no vacías. */
export interface HojaLeida {
  nombre: string;
  encabezados: string[];
  filas: FilaLeida[];
}

/** Convierte cualquier valor de celda de exceljs a texto recortado. */
export function valorTexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object') {
    if ('richText' in valor) return valor.richText.map((r) => r.text).join('').trim();
    if ('result' in valor) return valorTexto(valor.result as ExcelJS.CellValue);
    if ('text' in valor) return String(valor.text).trim();
    return '';
  }
  return String(valor).trim();
}

/** Lee todas las hojas del libro. */
export async function leerLibro(ruta: string): Promise<HojaLeida[]> {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(ruta);
  const hojas: HojaLeida[] = [];
  libro.eachSheet((hoja) => {
    const encabezados: string[] = [];
    hoja.getRow(1).eachCell({ includeEmpty: false }, (c, col) => {
      encabezados[col - 1] = valorTexto(c.value);
    });
    const filas: FilaLeida[] = [];
    for (let r = 2; r <= hoja.rowCount; r++) {
      const datos: FilaDatos = {};
      let alguno = false;
      encabezados.forEach((h, idx) => {
        if (!h) return;
        const v = valorTexto(hoja.getRow(r).getCell(idx + 1).value);
        datos[h] = v;
        if (v) alguno = true;
      });
      if (alguno) filas.push({ numeroFila: r, datos });
    }
    hojas.push({ nombre: hoja.name, encabezados: encabezados.filter(Boolean), filas });
  });
  return hojas;
}
