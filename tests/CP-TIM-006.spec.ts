import { test, expect } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { TimesheetPage } from "../pages/TimesheetPage";

// ============================================================================
// CONFIGURACIÓN GENERAL
// ============================================================================

// Tiempo máximo permitido para cada escenario.
// El ambiente demo de OrangeHRM puede presentar tiempos de respuesta variables.
test.setTimeout(60000);

// URL de acceso al ambiente demo de OrangeHRM.
const URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

// Credenciales utilizadas para autenticarse en el ambiente de pruebas.
const USERNAME = "Admin";
const PASSWORD = "admin123";

// ============================================================================
// DATOS DE PRUEBA - CP-TIM-006
// ============================================================================

// Proyecto válido utilizado en la segunda condición.
const PROJECT = "ACME Ltd";

// Cantidad válida de horas utilizada para aislar
// la validación de obligatoriedad de Project y Activity.
const VALID_HOURS = "8";

// ============================================================================
// CP-TIM-006 - VALIDACIÓN DE CAMPOS OBLIGATORIOS
// ============================================================================
//
// Los escenarios se ejecutan de manera secuencial:
//
// 1. Primero se valida Project vacío + Activity vacía.
// 2. Después se valida Project válido + Activity vacía.
//
// serial garantiza que Playwright no ejecute ambas condiciones en paralelo.
//
test.describe
  .serial("CP-TIM-006 - Validar obligatoriedad de Proyecto y Actividad", () => {
  // ==========================================================================
  // CONDICIÓN 1
  // ==========================================================================
  //
  // Project  = vacío
  // Activity = vacío
  // Horas    = 8
  //
  // Resultado esperado:
  // - Project debe mostrar validación.
  // - Activity debe mostrar validación.
  // - El sistema debe permanecer en Edit Timesheet.
  //
  // ==========================================================================

  test("Condición 1 - Rechazar el registro sin proyecto ni actividad", async ({
    page,
  }) => {
    // ----------------------------------------------------------------------
    // 1. INICIALIZACIÓN DE PAGE OBJECTS
    // ----------------------------------------------------------------------

    const loginPage = new LoginPage(page);
    const timesheetPage = new TimesheetPage(page);

    // ----------------------------------------------------------------------
    // 2. AUTENTICACIÓN
    // ----------------------------------------------------------------------

    await page.goto(URL);
    await loginPage.login(USERNAME, PASSWORD);

    // Confirmamos que el inicio de sesión fue exitoso.
    await expect(page).toHaveURL(/dashboard/);

    // ----------------------------------------------------------------------
    // 3. NAVEGACIÓN A LA HOJA DE TIEMPO
    // ----------------------------------------------------------------------

    await timesheetPage.openMyTimesheetForEditing();

    // Confirmamos que estamos en la pantalla de edición.
    await expect(page).toHaveURL(/editTimesheet/);

    // ----------------------------------------------------------------------
    // 4. PREPARACIÓN DE LOS DATOS
    // ----------------------------------------------------------------------

    // Creamos una nueva fila para trabajar con campos vacíos
    // y evitar depender de información registrada previamente.
    await timesheetPage.addNewRow();

    // No seleccionamos Project ni Activity.
    // Solamente registramos una cantidad válida de horas.
    await timesheetPage.enterHoursInLastRow(0, VALID_HOURS);

    // ----------------------------------------------------------------------
    // 5. EJECUCIÓN DE LA ACCIÓN A VALIDAR
    // ----------------------------------------------------------------------

    // Intentamos guardar la fila incompleta.
    await timesheetPage.saveTimesheet();

    // ----------------------------------------------------------------------
    // 6. VALIDACIONES DEL RESULTADO ESPERADO
    // ----------------------------------------------------------------------

    // Project debe ser identificado como campo obligatorio.
    await expect(timesheetPage.getProjectValidationMessage()).toBeVisible();

    // Activity debe ser identificada como campo obligatorio.
    await expect(timesheetPage.getActivityValidationMessage()).toBeVisible();

    // La información incompleta no debe permitir completar el guardado.
    await expect(page).toHaveURL(/editTimesheet/);
  });

  // ==========================================================================
  // CONDICIÓN 2
  // ==========================================================================
  //
  // Project  = ACME Ltd
  // Activity = vacío
  // Horas    = 8
  //
  // Resultado esperado:
  // - Project no debe mostrar validación.
  // - Activity debe mostrar validación.
  // - El sistema debe permanecer en Edit Timesheet.
  //
  // Esta condición inicia únicamente después de finalizar la Condición 1.
  //
  // ==========================================================================

  test("Condición 2 - Rechazar el registro con proyecto y sin actividad", async ({
    page,
  }) => {
    // ----------------------------------------------------------------------
    // 1. INICIALIZACIÓN DE PAGE OBJECTS
    // ----------------------------------------------------------------------

    const loginPage = new LoginPage(page);
    const timesheetPage = new TimesheetPage(page);

    // ----------------------------------------------------------------------
    // 2. AUTENTICACIÓN
    // ----------------------------------------------------------------------

    await page.goto(URL);
    await loginPage.login(USERNAME, PASSWORD);

    // Confirmamos que el inicio de sesión fue exitoso.
    await expect(page).toHaveURL(/dashboard/);

    // ----------------------------------------------------------------------
    // 3. NAVEGACIÓN A LA HOJA DE TIEMPO
    // ----------------------------------------------------------------------

    await timesheetPage.openMyTimesheetForEditing();

    // Confirmamos que estamos en la pantalla de edición.
    await expect(page).toHaveURL(/editTimesheet/);

    // ----------------------------------------------------------------------
    // 4. PREPARACIÓN DE LOS DATOS
    // ----------------------------------------------------------------------

    // Creamos una nueva fila independiente para esta condición.
    await timesheetPage.addNewRow();

    // Seleccionamos únicamente un proyecto válido.
    // Activity permanece intencionalmente vacía.
    await timesheetPage.selectProjectInLastRow(PROJECT);

    // Registramos una cantidad válida de horas.
    await timesheetPage.enterHoursInLastRow(0, VALID_HOURS);

    // ----------------------------------------------------------------------
    // 5. EJECUCIÓN DE LA ACCIÓN A VALIDAR
    // ----------------------------------------------------------------------

    // Intentamos guardar sin seleccionar Activity.
    await timesheetPage.saveTimesheet();

    // ----------------------------------------------------------------------
    // 6. VALIDACIONES DEL RESULTADO ESPERADO
    // ----------------------------------------------------------------------

    // Project contiene un valor válido, por lo que no debe mostrar error.
    await expect(timesheetPage.getProjectValidationMessage()).toBeHidden();

    // Activity permanece vacía y debe mostrar su validación.
    await expect(timesheetPage.getActivityValidationMessage()).toBeVisible();

    // La fila incompleta no debe permitir completar el guardado.
    await expect(page).toHaveURL(/editTimesheet/);
  });
});
