/**
 * Pages (POM) de OrangeHRM (capa: POM).
 *
 * Solo definen locators (Targets): sin lógica de negocio ni aserciones.
 * Prioridad de selectores: getByRole > getByLabel > getByPlaceholder > getByText > CSS.
 *
 * ESTADO DE LOS SELECTORES: los de CP-ADM-001 ya fueron ejecutados contra la app.
 * Los marcados "SUPUESTO" (CP-ADM-002 a 008) se validan en la primera ejecución.
 */
import type { Page } from 'playwright';
import type { Target } from '../screenplay/core';

/** Pantalla de acceso. */
export const LoginPage = {
  url: '/web/index.php/auth/login',
  // Placeholder: el login de OrangeHRM expone "Username"/"Password" como placeholders.
  usuario: ((page: Page) => page.getByPlaceholder('Username')) as Target,
  clave: ((page: Page) => page.getByPlaceholder('Password')) as Target,
  botonIngresar: ((page: Page) => page.getByRole('button', { name: 'Login' })) as Target,
};

/** Mensajes en pantalla (validaciones inline y toasts). Genérico: se busca por texto. */
export const MensajesPage = {
  /** SUPUESTO: el texto exacto viene del Excel (columna MensajeEsperado). */
  texto: (mensaje: string): Target => (page) => page.getByText(mensaje).first(),
};

/** Catálogo Admin → Job → Job Titles. */
export const JobTitlesPage = {
  url: '/web/index.php/admin/viewJobTitleList',
  encabezado: ((page: Page) => page.getByRole('heading', { name: 'Job Titles' })) as Target,
  botonAgregar: ((page: Page) => page.getByRole('button', { name: 'Add' })) as Target,
  /** Toast de confirmación al guardar. */
  mensajeGuardado: ((page: Page) => page.getByText('Successfully Saved').first()) as Target,
  /**
   * Fila(s) de la tabla cuyo título coincide EXACTAMENTE.
   * Se filtra por celda con texto exacto para que "a" no coincida con "Analyst".
   */
  filaDe: (titulo: string): Target => (page) =>
    page.getByRole('row').filter({ has: page.getByText(titulo, { exact: true }) }),
  /**
   * Celda(s) con el título EXACTO (sensible a mayúsculas). Se usa para CONTAR
   * puestos: la tabla de OrangeHRM anida roles "row", por eso no se cuentan filas.
   * SUPUESTO.
   */
  celdaDe: (titulo: string): Target => (page) => page.getByText(titulo, { exact: true }),
  /** Primera fila de datos (la 0 es el encabezado): indica que la tabla ya cargó. SUPUESTO. */
  primeraFilaDeDatos: ((page: Page) => page.getByRole('row').nth(1)) as Target,
  /** Botón eliminar (papelera) de la fila: es el primer botón de la fila. */
  botonEliminarDe: (titulo: string): Target => (page) =>
    page
      .getByRole('row')
      .filter({ has: page.getByText(titulo, { exact: true }) })
      .first()
      .getByRole('button')
      .first(),
  confirmarEliminacion: ((page: Page) =>
    page.getByRole('button', { name: /Yes, Delete/ })) as Target,
};

/** Formulario Add Job Title. */
export const AddJobTitlePage = {
  encabezado: ((page: Page) => page.getByRole('heading', { name: 'Add Job Title' })) as Target,
  // CSS justificado: la etiqueta "Job Title" no está asociada al input (sin for/id),
  // por lo que getByLabel no funciona; se ubica el grupo por su texto y luego el textbox.
  titulo: ((page: Page) =>
    page.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).getByRole('textbox')) as Target,
  descripcion: ((page: Page) => page.getByPlaceholder('Type description here')) as Target,
  nota: ((page: Page) => page.getByPlaceholder('Add note')) as Target,
  /** CSS justificado: el input de archivo está oculto y no tiene rol ni etiqueta. SUPUESTO. */
  especificacion: ((page: Page) => page.locator('input[type="file"]')) as Target,
  botonGuardar: ((page: Page) => page.getByRole('button', { name: 'Save' })) as Target,
};

/** PIM → Add Employee (solo para crear el empleado que se asigna a un puesto: CP-ADM-007). */
export const AddEmployeePage = {
  url: '/web/index.php/pim/addEmployee',
  nombre: ((page: Page) => page.getByPlaceholder('First Name')) as Target,
  apellido: ((page: Page) => page.getByPlaceholder('Last Name')) as Target,
  /** CSS justificado: igual que Job Title, la etiqueta no está asociada al input. SUPUESTO. */
  idEmpleado: ((page: Page) =>
    page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).getByRole('textbox')) as Target,
  botonGuardar: ((page: Page) => page.getByRole('button', { name: 'Save' })) as Target,
};

/** PIM → ficha del empleado → pestaña Job. SUPUESTO. */
export const EmployeeJobPage = {
  url: (empNumber: string) => `/web/index.php/pim/viewJobDetails/empNumber/${empNumber}`,
  /** Lista desplegable "Job Title" (componente oxd-select, sin rol nativo). */
  puesto: ((page: Page) =>
    page.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).locator('.oxd-select-text')) as Target,
  opcion: (titulo: string): Target => (page) =>
    page.getByRole('option', { name: titulo, exact: true }),
  /** Hay varios "Save" en la página; el primero es el de Job Details. */
  botonGuardar: ((page: Page) => page.getByRole('button', { name: 'Save' }).first()) as Target,
  mensajeActualizado: ((page: Page) =>
    page.getByText(/Successfully (Saved|Updated)/).first()) as Target,
};

/** PIM → Employee List (solo para limpiar el empleado creado). SUPUESTO. */
export const EmployeeListPage = {
  url: '/web/index.php/pim/viewEmployeeList',
  filtroId: ((page: Page) =>
    page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).getByRole('textbox')) as Target,
  botonBuscar: ((page: Page) => page.getByRole('button', { name: 'Search' })) as Target,
  celdaDe: (id: string): Target => (page) => page.getByText(id, { exact: true }),
  botonEliminarDe: (id: string): Target => (page) =>
    page
      .getByRole('row')
      .filter({ has: page.getByText(id, { exact: true }) })
      .first()
      .getByRole('button')
      .first(),
  confirmarEliminacion: ((page: Page) =>
    page.getByRole('button', { name: /Yes, Delete/ })) as Target,
};
