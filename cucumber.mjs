// ============================================================================
// cucumber.mjs — Configuración del runner (capa: infraestructura Cucumber)
// ----------------------------------------------------------------------------
// - Ejecuta SOLO .run/features/ (copias generadas por scripts/prepare-data.ts).
//   Los features fuente de /features nunca se ejecutan directamente.
// - Los formatters escriben en la carpeta de la corrida (reports/<fecha_hora>),
//   cuya ruta se lee de .run/run.json (también generado por prepare-data).
// - `strict` es true por defecto en Cucumber.js: pasos indefinidos/pendientes
//   hacen fallar la corrida. `retry: 0` evita reintentar acciones que cambian datos.
// - El perfil `headed` pasa `headed: true` por worldParameters; el navegador se
//   lanza en el primer `Before` (ver src/support/hooks.ts) porque BeforeAll no
//   recibe los parámetros del perfil.
// ============================================================================
import { existsSync, readFileSync } from 'node:fs';

const archivoCorrida = '.run/run.json';
const corrida = existsSync(archivoCorrida)
  ? JSON.parse(readFileSync(archivoCorrida, 'utf8'))
  : null;

const formatoReportes = corrida
  ? [
      'progress',
      `html:${corrida.reportDir}/cucumber-report.html`,
      `json:${corrida.reportDir}/cucumber-report.json`,
    ]
  : ['progress'];

const comun = {
  paths: ['.run/features/**/*.feature'],
  requireModule: ['ts-node/register'],
  require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  parallel: 0,
  retry: 0,
  tags: corrida?.tags ?? 'not @wip',
};

export default { ...comun, format: formatoReportes };

export const headed = {
  ...comun,
  format: formatoReportes,
  worldParameters: { headed: true },
};

export const dryrun = {
  ...comun,
  dryRun: true,
  format: ['progress'],
};
