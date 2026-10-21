/**
 * Questions adicionales (capa: Screenplay) — CP-ADM-002 a CP-ADM-008.
 *
 * Igual que questions.ts: esperan con auto-wait (sin pausas fijas) y devuelven
 * un valor; la aserción la hace el step.
 */
import { AddJobTitlePage, JobTitlesPage, MensajesPage } from '../../pages/orangehrm.pages';
import { BrowseTheWeb } from '../abilities/browse-the-web';
import type { Actor } from '../actors/actor';
import type { Question } from '../core';

async function aparece(localizar: () => { waitFor: (o: { state: 'visible' }) => Promise<void> }) {
  try {
    await localizar().waitFor({ state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

/** ¿Se muestra en pantalla este mensaje (validación o toast)? */
export class MensajeEnPantalla implements Question<boolean> {
  private constructor(private readonly mensaje: string) {}
  static con(mensaje: string): MensajeEnPantalla {
    return new MensajeEnPantalla(mensaje);
  }
  answeredBy(actor: Actor): Promise<boolean> {
    return aparece(() => MensajesPage.texto(this.mensaje)(BrowseTheWeb.as(actor)));
  }
}

/** ¿Sigue abierto el formulario "Add Job Title"? (si guardó, la app vuelve al listado). */
export class FormularioDeAltaAbierto implements Question<boolean> {
  static visible(): FormularioDeAltaAbierto {
    return new FormularioDeAltaAbierto();
  }
  answeredBy(actor: Actor): Promise<boolean> {
    return aparece(() => AddJobTitlePage.encabezado(BrowseTheWeb.as(actor)));
  }
}

/**
 * Cantidad de puestos con ese título EXACTO (sensible a mayúsculas) en el catálogo.
 * Primero espera a que la tabla cargue para no contar 0 por error.
 */
export class CantidadDePuestos implements Question<number> {
  private constructor(private readonly titulo: string) {}
  static conTitulo(titulo: string): CantidadDePuestos {
    return new CantidadDePuestos(titulo);
  }
  async answeredBy(actor: Actor): Promise<number> {
    const page = BrowseTheWeb.as(actor);
    await page.waitForURL(/viewJobTitleList/).catch(() => undefined);
    await JobTitlesPage.primeraFilaDeDatos(page)
      .waitFor({ state: 'visible' })
      .catch(() => undefined);
    return JobTitlesPage.celdaDe(this.titulo)(page).count();
  }
}
