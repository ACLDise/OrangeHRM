/**
 * Configuración tipada del proyecto (capa: configuración).
 *
 * Lee el archivo `.env` (nunca versionado) y centraliza rutas y timeouts.
 * Las credenciales NO viven en el código, en el Excel ni en los features.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

/** Rutas relativas a la raíz del proyecto. */
export const RUTAS = {
  run: '.run',
  runInfo: '.run/run.json',
  rows: '.run/rows.json',
  featuresGenerados: '.run/features',
  excel: 'data/input/datos_pruebas.xlsx',
  reportes: 'reports',
} as const;

/**
 * Timeouts en milisegundos. Un timeout es un LÍMITE de espera, nunca una pausa.
 * - step: tope de un paso de Cucumber (debe ser mayor que action/navigation/expect).
 * - action: tope de cada acción de Playwright (click, fill...).
 * - navigation: tope de goto / waitForURL (la demo pública puede ser lenta).
 * - expect: tope de las aserciones web-first (se reintentan hasta este valor).
 */
export const TIMEOUTS = {
  step: 90_000,
  action: 20_000,
  navigation: 45_000,
  expect: 20_000,
} as const;

/**
 * URL base del ambiente: solo el origen (esquema + host). Si E2E_BASE_URL incluye
 * una ruta (por ejemplo la del login), se descarta para que no afecte las rutas
 * relativas que usan las Pages.
 */
export const baseUrl: string = new URL(
  process.env.E2E_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
).origin;

/**
 * Credenciales del administrador, tomadas de `.env`.
 * @throws Error claro si faltan (sin mostrar ningún valor).
 */
export function credencialesAdmin(): { usuario: string; clave: string } {
  const usuario = process.env.E2E_USER ?? '';
  const clave = process.env.E2E_PASSWORD ?? '';
  if (!usuario || !clave) {
    throw new Error(
      'Faltan las credenciales de prueba. Defina E2E_USER y E2E_PASSWORD en el archivo .env (copie .env.example).',
    );
  }
  return { usuario, clave };
}
