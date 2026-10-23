/**
 * Questions (capa: Screenplay).
 *
 * Leen estado observable de la UI. Esperan con `waitFor` (auto-wait con timeout,
 * no pausas fijas) y devuelven un booleano; la aserción la hace el step.
 */
import { JobTitlesPage } from '../../pages/orangehrm.pages';
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

/** ¿El sistema mostró la confirmación de guardado? */
export class ConfirmacionDeGuardado implements Question<boolean> {
  static visible(): ConfirmacionDeGuardado {
    return new ConfirmacionDeGuardado();
  }
  answeredBy(actor: Actor): Promise<boolean> {
    return aparece(() => JobTitlesPage.mensajeGuardado(BrowseTheWeb.as(actor)));
  }
}

/** ¿El puesto aparece en el catálogo? */
export class PuestoEnElCatalogo implements Question<boolean> {
  private constructor(private readonly titulo: string) {}
  static llamado(titulo: string): PuestoEnElCatalogo {
    return new PuestoEnElCatalogo(titulo);
  }
  async answeredBy(actor: Actor): Promise<boolean> {
    const page = BrowseTheWeb.as(actor);
    // Tras guardar, la aplicación vuelve al listado: se espera por la URL, no por tiempo.
    await page.waitForURL(/viewJobTitleList/).catch(() => undefined);
    return aparece(() => JobTitlesPage.filaDe(this.titulo)(page).first());
  }
}
