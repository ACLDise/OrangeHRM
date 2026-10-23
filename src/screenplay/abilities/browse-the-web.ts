/**
 * Ability BrowseTheWeb (capa: Screenplay).
 *
 * Envuelve la `Page` de Playwright: es lo único que une al actor con el navegador.
 */
import type { Page } from 'playwright';
import type { Ability } from '../core';
import type { Actor } from '../actors/actor';

export class BrowseTheWeb implements Ability {
  constructor(readonly page: Page) {}

  /** Crea la habilidad a partir de una página. */
  static using(page: Page): BrowseTheWeb {
    return new BrowseTheWeb(page);
  }

  /** Atajo: la página del actor. */
  static as(actor: Actor): Page {
    return actor.abilityTo(BrowseTheWeb).page;
  }
}
