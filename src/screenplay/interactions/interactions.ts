/**
 * Interactions atómicas (capa: Screenplay).
 *
 * Usan los locators del POM (Targets). Sin esperas fijas: `fill`, `click` y `goto`
 * de Playwright ya esperan a que el elemento esté listo (auto-wait) hasta el
 * timeout de acción configurado en el contexto.
 */
import type { Actor } from '../actors/actor';
import { BrowseTheWeb } from '../abilities/browse-the-web';
import type { Interaction, Target } from '../core';

/** Navega a una ruta (relativa a la URL base del contexto). */
export class Navegar implements Interaction {
  private constructor(private readonly ruta: string) {}
  static a(ruta: string): Navegar {
    return new Navegar(ruta);
  }
  async performAs(actor: Actor): Promise<void> {
    await BrowseTheWeb.as(actor).goto(this.ruta);
  }
}

/** Escribe un texto en un campo (reemplaza el contenido). */
export class Escribir implements Interaction {
  private constructor(
    private readonly valor: string,
    private readonly campo: Target,
  ) {}
  /** @example Escribir.texto('abc').en(AddJobTitlePage.titulo) */
  static texto(valor: string): { en: (campo: Target) => Escribir } {
    return { en: (campo) => new Escribir(valor, campo) };
  }
  async performAs(actor: Actor): Promise<void> {
    await this.campo(BrowseTheWeb.as(actor)).fill(this.valor);
  }
}

/** Hace clic en un elemento. */
export class HacerClic implements Interaction {
  private constructor(private readonly elemento: Target) {}
  static en(elemento: Target): HacerClic {
    return new HacerClic(elemento);
  }
  async performAs(actor: Actor): Promise<void> {
    await this.elemento(BrowseTheWeb.as(actor)).click();
  }
}
