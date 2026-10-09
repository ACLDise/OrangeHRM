import { test, expect } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { TimesheetPage } from "../pages/TimesheetPage";

test.setTimeout(60000);

// ============================================================================
// CONFIGURACIÓN DEL AMBIENTE
// ============================================================================

// URL de acceso al ambiente demo de OrangeHRM.
const URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

// Credenciales utilizadas para autenticarse en el ambiente de pruebas.
const USERNAME = "Admin";
const PASSWORD = "admin123";

// ============================================================================
// DATOS DE PRUEBA - CP-TIM-003
// ============================================================================

// Proyecto y actividad válidos utilizados durante la prueba.
const PROJECT = "ACME Ltd";
const ACTIVITY = "Administration";

// Valor superior al límite permitido.
const INVALID_HOURS = "25";

// ============================================================================
// CASO DE PRUEBA
// ============================================================================

test("CP-TIM-003 - Rechazar el registro de horas superiores al límite permitido", async ({
  page,
}) => {
  // ------------------------------------------------------------------------
  // 1. INICIALIZACIÓN DE PAGE OBJECTS
  // ------------------------------------------------------------------------

  const loginPage = new LoginPage(page);
  const timesheetPage = new TimesheetPage(page);

  // ------------------------------------------------------------------------
  // 2. AUTENTICACIÓN
  // ------------------------------------------------------------------------

  await page.goto(URL);
  await loginPage.login(USERNAME, PASSWORD);

  // Verificamos que la autenticación haya sido exitosa.
  await expect(page).toHaveURL(/dashboard/);

  // ------------------------------------------------------------------------
  // 3. NAVEGACIÓN A LA HOJA DE TIEMPO
  // ------------------------------------------------------------------------

  await timesheetPage.openMyTimesheetForEditing();

  // Confirmamos que estamos en la pantalla de edición.
  await expect(page).toHaveURL(/editTimesheet/);

  // ------------------------------------------------------------------------
  // 4. PREPARACIÓN DE LOS DATOS
  // ------------------------------------------------------------------------

  // Seleccionamos un proyecto y una actividad válidos.
  await timesheetPage.selectProject(PROJECT);
  await timesheetPage.selectActivity(ACTIVITY);

  // Ingresamos un valor superior al límite permitido.
  await timesheetPage.enterHours(0, INVALID_HOURS);

  // Confirmamos que el valor haya sido ingresado en el campo esperado.
  await expect(timesheetPage.getHoursInput(0)).toHaveValue(INVALID_HOURS);

  // ------------------------------------------------------------------------
  // 5. EJECUCIÓN DE LA ACCIÓN A VALIDAR
  // ------------------------------------------------------------------------

  // Intentamos guardar la hoja de tiempo con el valor inválido.
  await timesheetPage.saveTimesheet();

  // ------------------------------------------------------------------------
  // 6. VALIDACIONES DEL RESULTADO ESPERADO
  // ------------------------------------------------------------------------

  // El sistema debe mostrar el mensaje de validación del campo de horas.
  await expect(timesheetPage.getHoursValidationMessage()).toBeVisible();

  // La operación inválida no debe permitir abandonar la pantalla de edición.
  await expect(page).toHaveURL(/editTimesheet/);
});
