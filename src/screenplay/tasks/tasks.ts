/**
 * Tasks de negocio (capa: Screenplay).
 *
 * Cada Task compone Interactions con los locators del POM. La sincronización se
 * hace con auto-wait y aserciones web-first (nunca con pausas fijas).
 */
import { expect } from '@playwright/test';
import { credencialesAdmin } from '../../config/config';
import {
  AddJobTitlePage,
  JobTitlesPage,
  LoginPage,
} from '../../pages/orangehrm.pages';
import { BrowseTheWeb } from '../abilities/browse-the-web';
import type { Actor } from '../actors/actor';
import type { Interaction, Task } from '../core';
import { Escribir, HacerClic, Navegar } from '../interactions/interactions';

/** El administrador inicia sesión con las credenciales de `.env`. */
export class IniciarSesion implements Task {
  static comoAdministrador(): IniciarSesion {
    return new IniciarSesion();
  }
  async performAs(actor: Actor): Promise<void> {
    const { usuario, clave } = credencialesAdmin();
    await actor.attemptsTo(
      Navegar.a(LoginPage.url),
      Escribir.texto(usuario).en(LoginPage.usuario),
      Escribir.texto(clave).en(LoginPage.clave),
      HacerClic.en(LoginPage.botonIngresar),
    );
    // Condición observable de fin de login: la URL pasa al dashboard.
    await BrowseTheWeb.as(actor).waitForURL(/dashboard/);
  }
}

/** El administrador abre el catálogo de puestos. */
export class IrAlCatalogoDePuestos implements Task {
  static ahora(): IrAlCatalogoDePuestos {
    return new IrAlCatalogoDePuestos();
  }
  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(Navegar.a(JobTitlesPage.url));
    await expect(JobTitlesPage.encabezado(BrowseTheWeb.as(actor))).toBeVisible();
  }
}

/** Datos de un puesto a registrar. */
export interface DatosPuesto {
  titulo: string;
  descripcion: string;
  nota: string;
}

/** El administrador registra un puesto (abre el formulario, lo llena y guarda). */
export class RegistrarPuesto implements Task {
  private constructor(private readonly datos: DatosPuesto) {}
  static con(datos: DatosPuesto): RegistrarPuesto {
    return new RegistrarPuesto(datos);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    await actor.attemptsTo(HacerClic.en(JobTitlesPage.botonAgregar));
    await expect(AddJobTitlePage.encabezado(page)).toBeVisible();

    const pasos: Interaction[] = [Escribir.texto(this.datos.titulo).en(AddJobTitlePage.titulo)];
    // Opcionales: solo se llenan si la fila trae longitud > 0.
    if (this.datos.descripcion) {
      pasos.push(Escribir.texto(this.datos.descripcion).en(AddJobTitlePage.descripcion));
    }
    if (this.datos.nota) {
      pasos.push(Escribir.texto(this.datos.nota).en(AddJobTitlePage.nota));
    }
    pasos.push(HacerClic.en(AddJobTitlePage.botonGuardar));
    await actor.attemptsTo(...pasos);
  }
}

/**
 * El administrador elimina un puesto del catálogo.
 * Se usa para la limpieza de lo que la propia suite creó (nunca puestos ajenos).
 */
export class EliminarPuesto implements Task {
  private constructor(private readonly titulo: string) {}
  static llamado(titulo: string): EliminarPuesto {
    return new EliminarPuesto(titulo);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    await actor.attemptsTo(IrAlCatalogoDePuestos.ahora());
    await actor.attemptsTo(
      HacerClic.en(JobTitlesPage.botonEliminarDe(this.titulo)),
      HacerClic.en(JobTitlesPage.confirmarEliminacion),
    );
    await expect(JobTitlesPage.filaDe(this.titulo)(page)).toHaveCount(0);
  }
}
