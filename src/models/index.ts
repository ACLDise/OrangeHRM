/**
 * Contratos TypeScript compartidos (capa: modelos).
 */

/** Datos de una fila del Excel: nombre de columna → valor (texto). Sin secretos. */
export type FilaDatos = Record<string, string>;

/** Información de la corrida actual, escrita por prepare-data en `.run/run.json`. */
export interface InfoCorrida {
  /** Identificador de la corrida, formato AAAA-MM-DD_HH-mm-ss. */
  runId: string;
  /** Carpeta de reportes de esta corrida (reports/<runId>). */
  reportDir: string;
  /** Expresión de tags de Cucumber (siempre excluye @wip). */
  tags: string;
}

/** Estado final de una fila ejecutada. */
export type EstadoFila = 'PASÓ' | 'FALLÓ' | 'OMITIDO';

/** Resultado de una fila, escrito por el hook After como `fila.json`. */
export interface ResultadoFila {
  testCaseId: string;
  idFila: string;
  escenario: string;
  datos: FilaDatos;
  estado: EstadoFila;
  pasoFallido: string;
  inicio: string;
  fin: string;
  duracionSeg: number;
  error: string;
  trace: string;
  video: string;
  screenshots: string[];
  notas: string;
}
