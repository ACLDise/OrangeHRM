/**
 * Step definitions del módulo de puestos (capa: steps, delgada).
 *
 * Solo traducen la frase a Screenplay; no contienen locators ni lógica de UI.
 * Una frase = una step definition. Las aserciones usan `expect` sobre lo que
 * responde una Question.
 *
 * Nota: con `# language: es`, el texto del paso excluye la palabra clave
 * ("Dado", "Cuando"...), por eso las frases comienzan con "que ..." cuando
 * el feature dice "Dado que ...".
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  ConfirmacionDeGuardado,
  PuestoEnElCatalogo,
} from '../screenplay/questions/questions';
import {
  IniciarSesion,
  IrAlCatalogoDePuestos,
  RegistrarPuesto,
} from '../screenplay/tasks/tasks';
import { textoDeLongitud, tituloUnico } from '../utils/texto';
import type { CustomWorld } from '../support/world';

Given('que el administrador ha iniciado sesión', async function (this: CustomWorld) {
  await this.actor.attemptsTo(IniciarSesion.comoAdministrador());
});

Given('que el administrador está en el catálogo de puestos', async function (this: CustomWorld) {
  await this.actor.attemptsTo(IrAlCatalogoDePuestos.ahora());
});

When(
  'registra un puesto con título de {int} caracteres, descripción de {int} caracteres y nota de {int} caracteres',
  async function (this: CustomWorld, longTitulo: number, longDescripcion: number, longNota: number) {
    // Los textos se generan con la longitud exacta; el título es único por ejecución.
    this.puestoActual = {
      titulo: tituloUnico(longTitulo),
      descripcion: textoDeLongitud(longDescripcion, 'Descripcion '),
      nota: textoDeLongitud(longNota, 'Nota '),
    };
    await this.actor.attemptsTo(RegistrarPuesto.con(this.puestoActual));
  },
);

Then('el sistema confirma que el puesto fue guardado', async function (this: CustomWorld) {
  const guardado = await this.actor.asks(ConfirmacionDeGuardado.visible());
  expect(guardado, 'Se esperaba la confirmación "Successfully Saved".').toBe(true);
  // Solo se registra para limpieza cuando el guardado quedó confirmado.
  if (this.puestoActual) this.puestosCreados.push(this.puestoActual.titulo);
});

Then('el puesto aparece en el catálogo de puestos', async function (this: CustomWorld) {
  const titulo = this.puestoActual?.titulo ?? '';
  const visible = await this.actor.asks(PuestoEnElCatalogo.llamado(titulo));
  expect(visible, 'Se esperaba ver el puesto registrado en el catálogo.').toBe(true);
});
