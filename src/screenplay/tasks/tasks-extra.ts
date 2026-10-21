/**
 * Tasks adicionales (capa: Screenplay) — CP-ADM-002 a CP-ADM-008.
 *
 * Mismo estilo que tasks.ts: cada Task compone Interactions con locators del POM,
 * sin esperas fijas (auto-wait + aserciones web-first).
 */
import { expect } from '@playwright/test';
import {
  AddEmployeePage,
  AddJobTitlePage,
  EmployeeJobPage,
  EmployeeListPage,
  JobTitlesPage,
} from '../../pages/orangehrm.pages';
import { BrowseTheWeb } from '../abilities/browse-the-web';
import type { Actor } from '../actors/actor';
import type { Interaction, Task } from '../core';
import { Escribir, HacerClic, Navegar } from '../interactions/interactions';
import { IrAlCatalogoDePuestos } from './tasks';

/** Adjunta un archivo en el campo "Job Specification" (campo de archivo oculto). */
export class AdjuntarEspecificacion implements Interaction {
  private constructor(private readonly rutaArchivo: string) {}
  static desde(rutaArchivo: string): AdjuntarEspecificacion {
    return new AdjuntarEspecificacion(rutaArchivo);
  }
  async performAs(actor: Actor): Promise<void> {
    await AddJobTitlePage.especificacion(BrowseTheWeb.as(actor)).setInputFiles(this.rutaArchivo);
  }
}

/**
 * Abre el formulario Add Job Title, escribe el título y adjunta la especificación.
 * NO guarda: el step decide si hace clic en Save.
 */
export class LlenarPuestoConEspecificacion implements Task {
  private constructor(
    private readonly titulo: string,
    private readonly rutaArchivo: string,
  ) {}
  static con(titulo: string, rutaArchivo: string): LlenarPuestoConEspecificacion {
    return new LlenarPuestoConEspecificacion(titulo, rutaArchivo);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    await actor.attemptsTo(HacerClic.en(JobTitlesPage.botonAgregar));
    await expect(AddJobTitlePage.encabezado(page)).toBeVisible();
    await actor.attemptsTo(
      Escribir.texto(this.titulo).en(AddJobTitlePage.titulo),
      AdjuntarEspecificacion.desde(this.rutaArchivo),
    );
  }
}

/** Intenta eliminar un puesto SIN esperar que desaparezca (el sistema puede bloquearlo). */
export class IntentarEliminarPuesto implements Task {
  private constructor(private readonly titulo: string) {}
  static llamado(titulo: string): IntentarEliminarPuesto {
    return new IntentarEliminarPuesto(titulo);
  }
  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      IrAlCatalogoDePuestos.ahora(),
      HacerClic.en(JobTitlesPage.botonEliminarDe(this.titulo)),
      HacerClic.en(JobTitlesPage.confirmarEliminacion),
    );
  }
}

/** Datos de un empleado de prueba. `id` y `empNumber` los completa RegistrarEmpleado. */
export interface DatosEmpleado {
  nombre: string;
  apellido: string;
  /** Employee Id generado por el sistema (se lee del formulario). */
  id?: string;
  /** Número interno del empleado (viene en la URL tras guardar). */
  empNumber?: string;
}

/**
 * Registra un empleado (PIM → Add Employee).
 * Efecto: completa `datos.id` y `datos.empNumber` para los pasos siguientes y la limpieza.
 */
export class RegistrarEmpleado implements Task {
  private constructor(private readonly datos: DatosEmpleado) {}
  static con(datos: DatosEmpleado): RegistrarEmpleado {
    return new RegistrarEmpleado(datos);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    await actor.attemptsTo(
      Navegar.a(AddEmployeePage.url),
      Escribir.texto(this.datos.nombre).en(AddEmployeePage.nombre),
      Escribir.texto(this.datos.apellido).en(AddEmployeePage.apellido),
    );
    // El Employee Id se autogenera al cargar el formulario: se espera a que tenga valor
    // y se usa ese (así no se pisa con la carga asíncrona y no hay colisiones).
    const campoId = AddEmployeePage.idEmpleado(page);
    await expect(campoId).not.toHaveValue('');
    this.datos.id = await campoId.inputValue();

    await actor.attemptsTo(HacerClic.en(AddEmployeePage.botonGuardar));
    await page.waitForURL(/viewPersonalDetails\/empNumber\/\d+/);
    this.datos.empNumber = /empNumber\/(\d+)/.exec(page.url())?.[1];
    if (!this.datos.empNumber) throw new Error('No se pudo leer el número del empleado creado.');
  }
}

/** Asigna un puesto a un empleado (PIM → Job → Job Title → Save). */
export class AsignarPuestoAEmpleado implements Task {
  private constructor(
    private readonly empleado: DatosEmpleado,
    private readonly titulo: string,
  ) {}
  static con(empleado: DatosEmpleado, titulo: string): AsignarPuestoAEmpleado {
    return new AsignarPuestoAEmpleado(empleado, titulo);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    if (!this.empleado.empNumber) throw new Error('El empleado no tiene número; regístrelo primero.');
    await actor.attemptsTo(
      Navegar.a(EmployeeJobPage.url(this.empleado.empNumber)),
      HacerClic.en(EmployeeJobPage.puesto),
      HacerClic.en(EmployeeJobPage.opcion(this.titulo)),
      HacerClic.en(EmployeeJobPage.botonGuardar),
    );
    await expect(EmployeeJobPage.mensajeActualizado(page)).toBeVisible();
  }
}

/** Elimina un empleado por su Employee Id (limpieza de lo creado por la propia fila). */
export class EliminarEmpleado implements Task {
  private constructor(private readonly id: string) {}
  static conId(id: string): EliminarEmpleado {
    return new EliminarEmpleado(id);
  }
  async performAs(actor: Actor): Promise<void> {
    const page = BrowseTheWeb.as(actor);
    await actor.attemptsTo(
      Navegar.a(EmployeeListPage.url),
      Escribir.texto(this.id).en(EmployeeListPage.filtroId),
      HacerClic.en(EmployeeListPage.botonBuscar),
      HacerClic.en(EmployeeListPage.botonEliminarDe(this.id)),
      HacerClic.en(EmployeeListPage.confirmarEliminacion),
    );
    await expect(EmployeeListPage.celdaDe(this.id)(page)).toHaveCount(0);
  }
}
