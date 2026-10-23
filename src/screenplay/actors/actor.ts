/**
 * Actor (capa: Screenplay).
 *
 * Quien ejecuta el caso. Posee Abilities y ejecuta Tasks (`attemptsTo`) o
 * responde Questions (`asks`).
 */
import type { Ability, Question, Task } from '../core';

export class Actor {
  private readonly habilidades = new Map<unknown, Ability>();

  private constructor(readonly nombre: string) {}

  /** Crea un actor con nombre (aparece en los mensajes de error). */
  static named(nombre: string): Actor {
    return new Actor(nombre);
  }

  /** Otorga habilidades al actor. @example Actor.named('Admin').whoCan(BrowseTheWeb.using(page)) */
  whoCan(...habilidades: Ability[]): this {
    for (const h of habilidades) this.habilidades.set(h.constructor, h);
    return this;
  }

  /** Obtiene una habilidad por su clase. @throws Error si el actor no la tiene. */
  abilityTo<T extends Ability>(tipo: new (...args: never[]) => T): T {
    const h = this.habilidades.get(tipo);
    if (!h) throw new Error(`El actor "${this.nombre}" no tiene la habilidad ${tipo.name}.`);
    return h as T;
  }

  /** Ejecuta las tareas en orden. */
  async attemptsTo(...tareas: Task[]): Promise<void> {
    for (const tarea of tareas) await tarea.performAs(this);
  }

  /** Responde una pregunta sobre el estado de la UI. */
  asks<T>(pregunta: Question<T>): Promise<T> {
    return pregunta.answeredBy(this);
  }
}
