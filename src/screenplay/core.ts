/**
 * Contratos del Screenplay ligero (capa: Screenplay).
 *
 * Interfaces pequeñas (ISP): Ability, Task/Interaction y Question<T>.
 * Steps y hooks dependen de estos contratos, no de páginas concretas (DIP).
 */
import type { Locator, Page } from 'playwright';
import type { Actor } from './actors/actor';

/** Función que, dada la página, devuelve el locator de un elemento (definido en el POM). */
export type Target = (page: Page) => Locator;

/** Capacidad del actor (por ejemplo, navegar la web). */
export interface Ability {}

/** Acción de negocio. Una Interaction es una Task atómica. */
export interface Task {
  performAs(actor: Actor): Promise<void>;
}

/** Acción atómica reutilizable (clic, escribir, navegar). */
export type Interaction = Task;

/** Consulta del estado observable de la UI; la usan los pasos `Entonces`. */
export interface Question<T> {
  answeredBy(actor: Actor): Promise<T>;
}
