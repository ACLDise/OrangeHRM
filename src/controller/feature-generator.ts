/**
 * Parser/generador de features (capa: controller).
 *
 * Localiza el bloque `@excel` + `Ejemplos:` de un feature fuente y lo reemplaza
 * por un bloque `Ejemplos:` por cada fila del Excel, con el tag `@fila:<IdFila>`.
 * Así cada fila es un escenario independiente en el reporte. Los features fuente
 * nunca se modifican: se trabaja sobre copias en `.run/features/`.
 */

/** Bloque `@excel Ejemplos:` encontrado en un feature. */
export interface BloqueExcel {
  /** Índice (0-based) de la línea `@excel`. */
  inicio: number;
  /** Índice de la última línea de la tabla. */
  fin: number;
  /** Indentación del bloque. */
  indent: string;
  encabezados: string[];
  /** Filas de ejemplo ficticias del feature (cada una, lista de celdas). */
  filasEjemplo: string[][];
}

/** Divide una línea de tabla Gherkin en celdas. */
export function dividirCeldas(linea: string): string[] {
  return linea
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

/** Busca el bloque `@excel` + `Ejemplos:`. Devuelve null si no existe o no tiene tabla. */
export function leerBloqueExcel(lineas: string[]): BloqueExcel | null {
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].trim() !== '@excel') continue;
    let j = i + 1;
    while (j < lineas.length && lineas[j].trim() === '') j++;
    if (!/^Ejemplos:/.test((lineas[j] ?? '').trim())) continue;
    const tabla: string[] = [];
    let k = j + 1;
    while (k < lineas.length && lineas[k].trim().startsWith('|')) {
      tabla.push(lineas[k]);
      k++;
    }
    if (tabla.length < 1) return null;
    return {
      inicio: i,
      fin: k - 1,
      indent: lineas[i].match(/^\s*/)?.[0] ?? '',
      encabezados: dividirCeldas(tabla[0]),
      filasEjemplo: tabla.slice(1).map(dividirCeldas),
    };
  }
  return null;
}

/** Extrae el TestCaseId (tag @CP-XXX-000) del feature. */
export function leerTestCaseId(contenido: string): string | null {
  return contenido.match(/@(CP-[A-Za-z]+-\d+)\b/)?.[1] ?? null;
}

function celda(valor: string): string {
  return valor.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/**
 * Genera las líneas que reemplazan al bloque @excel: un `Ejemplos:` por fila.
 * @param bloque bloque original
 * @param filas filas habilitadas (columna → valor)
 */
export function renderizarBloque(
  bloque: BloqueExcel,
  filas: Array<Record<string, string>>,
): string[] {
  const salida: string[] = [];
  for (const fila of filas) {
    salida.push(`${bloque.indent}@fila:${fila.IdFila}`);
    salida.push(`${bloque.indent}Ejemplos:`);
    salida.push(`${bloque.indent}  | ${bloque.encabezados.join(' | ')} |`);
    salida.push(`${bloque.indent}  | ${bloque.encabezados.map((h) => celda(fila[h] ?? '')).join(' | ')} |`);
    salida.push('');
  }
  return salida;
}

/** Aplica el reemplazo y devuelve el contenido del feature generado. */
export function generarFeature(
  contenido: string,
  filas: Array<Record<string, string>>,
): string {
  const lineas = contenido.split(/\r?\n/);
  const bloque = leerBloqueExcel(lineas);
  if (!bloque) throw new Error('El feature no tiene un bloque "@excel Ejemplos:" válido.');
  const nuevo = [
    ...lineas.slice(0, bloque.inicio),
    ...renderizarBloque(bloque, filas),
    ...lineas.slice(bloque.fin + 1),
  ];
  return nuevo.join('\n');
}
