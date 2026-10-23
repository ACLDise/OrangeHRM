/**
 * Hooks del ciclo de vida (capa: infraestructura Cucumber).
 *
 * - Browser: se lanza una vez, de forma perezosa en el primer Before, porque el
 *   perfil (headed/headless) solo llega por el World (ver cucumber.mjs).
 * - Before: contexto NUEVO por fila (aislamiento), video, trace, fila del Excel y Actor.
 * - AfterStep: screenshot por paso (con la contraseña enmascarada).
 * - After: limpieza de lo creado, screenshot final, trace, video y fila.json
 *   (insumo de resultados.xlsx).
 * - Evidencias SIEMPRE activas, pasen o fallen, en reports/<corrida>/evidencias/...
 */
import {
  After,
  AfterAll,
  AfterStep,
  Before,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Browser, chromium } from 'playwright';
import { RUTAS, TIMEOUTS, baseUrl } from '../config/config';
import type { FilaDatos, InfoCorrida, ResultadoFila } from '../models';
import { BrowseTheWeb } from '../screenplay/abilities/browse-the-web';
import { Actor } from '../screenplay/actors/actor';
import { EliminarPuesto } from '../screenplay/tasks/tasks';
import { EliminarEmpleado } from '../screenplay/tasks/tasks-extra';
import { ocultarSecreto } from '../utils/texto';
import { CustomWorld } from './world';

// Tope de un paso de Cucumber: mayor que los timeouts de acción/navegación/expect.
setDefaultTimeout(TIMEOUTS.step);
expect.configure({ timeout: TIMEOUTS.expect });

let browser: Browser | undefined;

async function obtenerBrowser(headed: boolean): Promise<Browser> {
  if (!browser) browser = await chromium.launch({ headless: !headed });
  return browser;
}

function leerJson<T>(ruta: string): T {
  return JSON.parse(fs.readFileSync(ruta, 'utf8')) as T;
}

Before(async function (this: CustomWorld, { pickle }) {
  const tagFila = pickle.tags.find((t) => t.name.startsWith('@fila:'));
  if (!tagFila) throw new Error('El escenario no tiene tag @fila:<IdFila>. Ejecute prepare-data.');
  this.idFila = tagFila.name.slice('@fila:'.length);
  this.testCaseId = this.idFila.replace(/-\d+$/, '');
  this.inicio = new Date();

  const filas = leerJson<Record<string, FilaDatos>>(RUTAS.rows);
  const fila = filas[this.idFila];
  if (!fila) throw new Error(`La fila ${this.idFila} no está en ${RUTAS.rows}.`);
  this.row = fila;

  const corrida = leerJson<InfoCorrida>(RUTAS.runInfo);
  this.evidenceDir = path.resolve(corrida.reportDir, 'evidencias', this.testCaseId, this.idFila);
  fs.mkdirSync(this.evidenceDir, { recursive: true });

  const nav = await obtenerBrowser(this.headed);
  this.context = await nav.newContext({
    baseURL: baseUrl,
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: this.evidenceDir, size: { width: 1280, height: 720 } },
  });
  this.context.setDefaultTimeout(TIMEOUTS.action);
  this.context.setDefaultNavigationTimeout(TIMEOUTS.navigation);
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  this.page = await this.context.newPage();
  this.actor = Actor.named('Administrador').whoCan(BrowseTheWeb.using(this.page));
});

AfterStep(async function (this: CustomWorld, { pickleStep, result }) {
  this.contadorPasos += 1;
  if (result.status === Status.FAILED) this.pasoFallido = pickleStep.text;
  if (!this.page || this.page.isClosed()) return;
  try {
    const buffer = await this.page.screenshot({
      mask: [this.page.locator('input[type="password"]')],
    });
    const archivo = path.join(
      this.evidenceDir,
      `paso-${String(this.contadorPasos).padStart(2, '0')}.png`,
    );
    fs.writeFileSync(archivo, buffer);
    this.screenshots.push(archivo);
    this.attach(buffer, 'image/png');
  } catch {
    // Una captura fallida no debe invalidar el resultado del paso.
  }
});

After(async function (this: CustomWorld, { result, pickle }) {
  const notas: string[] = [];

  // Limpieza: elimina SOLO lo que esta fila creó (nunca datos ajenos).
  // Primero los empleados: un puesto con empleados asignados no se puede eliminar.
  for (const id of this.empleadosCreados) {
    try {
      await this.actor.attemptsTo(EliminarEmpleado.conId(id));
    } catch (e) {
      notas.push(`No se pudo eliminar el empleado creado con Id "${id}" (revisar manualmente).`);
    }
  }
  for (const titulo of this.puestosCreados) {
    try {
      await this.actor.attemptsTo(EliminarPuesto.llamado(titulo));
    } catch (e) {
      notas.push(`No se pudo eliminar el puesto creado "${titulo}" (revisar manualmente).`);
    }
  }

  const rutaTrace = path.join(this.evidenceDir, 'trace.zip');
  const rutaVideo = path.join(this.evidenceDir, 'video.webm');

  if (this.page && !this.page.isClosed()) {
    try {
      const buffer = await this.page.screenshot({
        mask: [this.page.locator('input[type="password"]')],
      });
      const archivo = path.join(this.evidenceDir, 'final.png');
      fs.writeFileSync(archivo, buffer);
      this.screenshots.push(archivo);
      this.attach(buffer, 'image/png');
    } catch {
      /* sin captura final */
    }
  }

  const video = this.page?.video();
  await this.context.tracing.stop({ path: rutaTrace });
  await this.context.close();
  if (video) {
    await video.saveAs(rutaVideo).catch(() => undefined);
    await video.delete().catch(() => undefined);
  }
  this.attach(`Trace: ${rutaTrace}\nVideo: ${rutaVideo}`, 'text/plain');

  const estado: ResultadoFila['estado'] =
    result?.status === Status.PASSED
      ? 'PASÓ'
      : result?.status === Status.SKIPPED
        ? 'OMITIDO'
        : 'FALLÓ';
  const fin = new Date();
  const error = ocultarSecreto(
    (result?.message ?? '').split('\n').slice(0, 6).join(' ').slice(0, 400),
    process.env.E2E_PASSWORD,
  );

  const resultadoFila: ResultadoFila = {
    testCaseId: this.testCaseId,
    idFila: this.idFila,
    escenario: pickle.name,
    datos: this.row,
    estado,
    pasoFallido: this.pasoFallido,
    inicio: this.inicio.toISOString(),
    fin: fin.toISOString(),
    duracionSeg: Math.round((fin.getTime() - this.inicio.getTime()) / 100) / 10,
    error,
    trace: rutaTrace,
    video: rutaVideo,
    screenshots: this.screenshots,
    notas: notas.join(' '),
  };
  fs.writeFileSync(path.join(this.evidenceDir, 'fila.json'), JSON.stringify(resultadoFila, null, 2));
});

AfterAll(async function () {
  if (browser) await browser.close();
});
