/**
 * CustomWorld tipado (capa: infraestructura Cucumber).
 *
 * Único mecanismo para compartir estado entre pasos de un escenario (prohibidas
 * las variables globales). Se crea un World nuevo por escenario/fila.
 */
import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from 'playwright';
import type { FilaDatos } from '../models';
import type { Actor } from '../screenplay/actors/actor';

export class CustomWorld extends World {
  context!: BrowserContext;
  page!: Page;
  actor!: Actor;
  /** Datos completos de la fila del Excel (incluye columnas auxiliares). */
  row: FilaDatos = {};
  idFila = '';
  testCaseId = '';
  /** reports/<corrida>/evidencias/<TestCaseId>/<IdFila>/ */
  evidenceDir = '';
  inicio = new Date();
  contadorPasos = 0;
  pasoFallido = '';
  screenshots: string[] = [];
  /** Puestos creados por esta fila (se eliminan en la limpieza del hook After). */
  puestosCreados: string[] = [];
  /** Employee Id de los empleados creados por esta fila (se eliminan ANTES que los puestos). */
  empleadosCreados: string[] = [];
  /** Datos del puesto que se está registrando en el escenario. */
  puestoActual?: { titulo: string; descripcion: string; nota: string };

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** ¿El perfil de ejecución pidió navegador visible? (perfil `headed`). */
  get headed(): boolean {
    return this.parameters?.headed === true;
  }
}

setWorldConstructor(CustomWorld);
