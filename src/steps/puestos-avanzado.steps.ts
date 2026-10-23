/**
 * Step definitions de CP-ADM-002 a CP-ADM-008 (capa: steps, delgada).
 *
 * Igual que puestos.steps.ts: solo traducen la frase a Screenplay, sin locators.
 * Los pasos de CP-ADM-001 ("el sistema confirma que el puesto fue guardado",
 * "el puesto aparece en el catálogo de puestos", etc.) se reutilizan desde allí.
 *
 * Nota: con `# language: es`, el texto del paso excluye la palabra clave
 * ("Dado", "Cuando"...), por eso las frases comienzan con "que ..." cuando
 * el feature dice "Dado que ...".
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import * as path from 'path';
import { RUTAS } from '../config/config';
import {
  CantidadDePuestos,
  FormularioDeAltaAbierto,
  MensajeEnPantalla,
} from '../screenplay/questions/questions-extra';
import { ConfirmacionDeGuardado } from '../screenplay/questions/questions';
import {
  EliminarPuesto,
  IrAlCatalogoDePuestos,
  RegistrarPuesto,
} from '../screenplay/tasks/tasks';
import {
  AsignarPuestoAEmpleado,
  type DatosEmpleado,
  IntentarEliminarPuesto,
  LlenarPuestoConEspecificacion,
  RegistrarEmpleado,
} from '../screenplay/tasks/tasks-extra';
import { KB, aplicarVariacion, generarPdf } from '../utils/generadores';
import { tituloUnico, tokenUnico } from '../utils/texto';
import type { CustomWorld } from '../support/world';
import { HacerClic } from '../screenplay/interactions/interactions';
import { AddJobTitlePage } from '../pages/orangehrm.pages';

/** Devuelve el título del puesto del escenario o falla con un mensaje claro. */
function tituloActual(world: CustomWorld): string {
  if (!world.puestoActual) throw new Error('No hay un puesto en el escenario: falta el paso previo.');
  return world.puestoActual.titulo;
}

/** Genera el PDF del tamaño pedido en .run/adjuntos/ (se recrea en cada corrida). */
function crearPdf(tamanoKB: number): string {
  const ruta = path.join(RUTAS.run, 'adjuntos', `especificacion-${tamanoKB}KB.pdf`);
  return generarPdf(ruta, tamanoKB * KB);
}

// ---------------------------------------------------------------------------
// CP-ADM-002 — límite de 100 caracteres en el título
// ---------------------------------------------------------------------------
When(
  'intenta registrar un puesto con título de {int} caracteres',
  async function (this: CustomWorld, longTitulo: number) {
    this.puestoActual = { titulo: tituloUnico(longTitulo), descripcion: '', nota: '' };
    await this.actor.attemptsTo(RegistrarPuesto.con(this.puestoActual));
  },
);

// ---------------------------------------------------------------------------
// CP-ADM-003 / CP-ADM-004 — especificación PDF
// ---------------------------------------------------------------------------
When(
  'registra un puesto con una especificación PDF de {int} KB',
  async function (this: CustomWorld, tamanoKB: number) {
    this.puestoActual = { titulo: tituloUnico(30), descripcion: '', nota: '' };
    await this.actor.attemptsTo(
      LlenarPuestoConEspecificacion.con(this.puestoActual.titulo, crearPdf(tamanoKB)),
      HacerClic.en(AddJobTitlePage.botonGuardar),
    );
  },
);

When(
  'intenta registrar un puesto con una especificación PDF de {int} KB',
  async function (this: CustomWorld, tamanoKB: number) {
    this.puestoActual = { titulo: tituloUnico(30), descripcion: '', nota: '' };
    // Se hace clic en Save aunque el error aparezca al adjuntar: así se prueba también el bloqueo.
    await this.actor.attemptsTo(
      LlenarPuestoConEspecificacion.con(this.puestoActual.titulo, crearPdf(tamanoKB)),
      HacerClic.en(AddJobTitlePage.botonGuardar),
    );
  },
);

// ---------------------------------------------------------------------------
// CP-ADM-005 / 006 / 007 / 008 — puesto precargado (precondición)
// ---------------------------------------------------------------------------
Given(
  'que existe un puesto registrado con título de {int} caracteres',
  async function (this: CustomWorld, longTitulo: number) {
    this.puestoActual = { titulo: tituloUnico(longTitulo), descripcion: '', nota: '' };
    await this.actor.attemptsTo(
      IrAlCatalogoDePuestos.ahora(),
      RegistrarPuesto.con(this.puestoActual),
    );
    const guardado = await this.actor.asks(ConfirmacionDeGuardado.visible());
    expect(guardado, 'La precondición falló: no se pudo registrar el puesto inicial.').toBe(true);
    // Registrado para limpieza solo cuando el guardado quedó confirmado.
    this.puestosCreados.push(this.puestoActual.titulo);
  },
);

// ---------------------------------------------------------------------------
// CP-ADM-005 / 006 — duplicados
// ---------------------------------------------------------------------------
When('intenta registrar otro puesto con el mismo título', async function (this: CustomWorld) {
  await this.actor.attemptsTo(
    RegistrarPuesto.con({ titulo: tituloActual(this), descripcion: '', nota: '' }),
  );
});

When(
  'intenta registrar otro puesto con el mismo título en {word}',
  async function (this: CustomWorld, variacion: string) {
    const variante = aplicarVariacion(tituloActual(this), variacion);
    await this.actor.attemptsTo(RegistrarPuesto.con({ titulo: variante, descripcion: '', nota: '' }));
  },
);

Then(
  'solo existe un puesto con ese título en el catálogo',
  async function (this: CustomWorld) {
    const titulo = tituloActual(this);
    await this.actor.attemptsTo(IrAlCatalogoDePuestos.ahora());
    const cantidad = await this.actor.asks(CantidadDePuestos.conTitulo(titulo));
    expect(cantidad, `Se esperaba 1 puesto con el título "${titulo}".`).toBe(1);
  },
);

Then(
  'no existe un puesto con el título en {word}',
  async function (this: CustomWorld, variacion: string) {
    const variante = aplicarVariacion(tituloActual(this), variacion);
    await this.actor.attemptsTo(IrAlCatalogoDePuestos.ahora());
    const cantidad = await this.actor.asks(CantidadDePuestos.conTitulo(variante));
    expect(cantidad, `No debía crearse el puesto "${variante}".`).toBe(0);
  },
);

// ---------------------------------------------------------------------------
// CP-ADM-007 — puesto con empleado asignado
// ---------------------------------------------------------------------------
Given('que el puesto tiene un empleado asignado', async function (this: CustomWorld) {
  const empleado: DatosEmpleado = { nombre: 'QA', apellido: `Auto${tokenUnico()}` };
  await this.actor.attemptsTo(RegistrarEmpleado.con(empleado));
  // Se registra para limpieza apenas existe (se elimina ANTES que el puesto).
  if (empleado.id) this.empleadosCreados.push(empleado.id);
  await this.actor.attemptsTo(AsignarPuestoAEmpleado.con(empleado, tituloActual(this)));
});

When('intenta eliminar el puesto', async function (this: CustomWorld) {
  await this.actor.attemptsTo(IntentarEliminarPuesto.llamado(tituloActual(this)));
});

Then('el puesto sigue en el catálogo de puestos', async function (this: CustomWorld) {
  const titulo = tituloActual(this);
  await this.actor.attemptsTo(IrAlCatalogoDePuestos.ahora());
  const cantidad = await this.actor.asks(CantidadDePuestos.conTitulo(titulo));
  expect(cantidad, `Se esperaba que el puesto "${titulo}" siguiera en el catálogo.`).toBe(1);
});

// ---------------------------------------------------------------------------
// CP-ADM-008 — eliminación de un puesto sin dependencias
// ---------------------------------------------------------------------------
When('el administrador elimina el puesto', async function (this: CustomWorld) {
  const titulo = tituloActual(this);
  await this.actor.attemptsTo(EliminarPuesto.llamado(titulo));
  // Ya se eliminó: no hace falta (ni se puede) eliminarlo en la limpieza.
  this.puestosCreados = this.puestosCreados.filter((t) => t !== titulo);
});

Then('el puesto ya no aparece en el catálogo de puestos', async function (this: CustomWorld) {
  const titulo = tituloActual(this);
  const cantidad = await this.actor.asks(CantidadDePuestos.conTitulo(titulo));
  expect(cantidad, `El puesto "${titulo}" no debía aparecer en el catálogo.`).toBe(0);
});

// ---------------------------------------------------------------------------
// Pasos compartidos por varios casos
// ---------------------------------------------------------------------------
Then(
  'el sistema muestra el mensaje {string}',
  async function (this: CustomWorld, mensaje: string) {
    const visible = await this.actor.asks(MensajeEnPantalla.con(mensaje));
    expect(visible, `Se esperaba ver el mensaje "${mensaje}".`).toBe(true);
  },
);

Then('el puesto no se guarda', async function (this: CustomWorld) {
  // Si el guardado hubiera ocurrido, la aplicación volvería al listado y el formulario se cerraría.
  const abierto = await this.actor.asks(FormularioDeAltaAbierto.visible());
  expect(abierto, 'El formulario se cerró: el puesto parece haberse guardado.').toBe(true);
});
