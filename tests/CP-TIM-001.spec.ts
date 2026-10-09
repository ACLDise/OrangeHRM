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
// DATOS DE PRUEBA - CP-TIM-001
// ============================================================================

// Proyecto y actividad utilizados para realizar el registro de horas.
const PROJECT = "ACME Ltd";
const ACTIVITY = "Administration";

// Valor inválido utilizado para comprobar el rechazo de horas negativas.
const INVALID_HOURS = "-5";

// ============================================================================
// CASO DE PRUEBA
// ============================================================================

test("CP-TIM-001 - Rechazar el registro de horas negativas", async ({
  page,
}) => {
  // --------------------------------------------------------------------------
  // 1. INICIALIZACIÓN DE PAGE OBJECTS
  // --------------------------------------------------------------------------

  // LoginPage gestiona las acciones relacionadas con la autenticación.
  const loginPage = new LoginPage(page);

  // TimesheetPage gestiona la navegación e interacción con las hojas de tiempo.
  const timesheetPage = new TimesheetPage(page);

  // --------------------------------------------------------------------------
  // 2. AUTENTICACIÓN
  // --------------------------------------------------------------------------

  // Accedemos a OrangeHRM e iniciamos sesión con las credenciales definidas.
  await page.goto(URL);
  await loginPage.login(USERNAME, PASSWORD);

  // Verificamos que el inicio de sesión haya dirigido al Dashboard.
  await expect(page).toHaveURL(/dashboard/);

  // --------------------------------------------------------------------------
  // 3. NAVEGACIÓN A LA HOJA DE TIEMPO
  // --------------------------------------------------------------------------

  // Navegamos hasta Time > Timesheets > My Timesheets > Edit.
  await timesheetPage.openMyTimesheetForEditing();

  // Confirmamos que el usuario se encuentre en la pantalla de edición.
  await expect(page).toHaveURL(/editTimesheet/);

  // --------------------------------------------------------------------------
  // 4. PREPARACIÓN DE LOS DATOS DEL CASO
  // --------------------------------------------------------------------------

  // Seleccionamos un proyecto y una actividad válidos.
  await timesheetPage.selectProject(PROJECT);
  await timesheetPage.selectActivity(ACTIVITY);

  // Ingresamos el valor negativo en el primer día de la semana.
  await timesheetPage.enterHours(0, INVALID_HOURS);

  // Confirmamos que el dato de prueba haya sido ingresado en el campo esperado.
  await expect(timesheetPage.getHoursInput(0)).toHaveValue(INVALID_HOURS);

  // --------------------------------------------------------------------------
  // 5. EJECUCIÓN DE LA ACCIÓN A VALIDAR
  // --------------------------------------------------------------------------

  // Intentamos guardar la hoja de tiempo con el valor inválido.
  await timesheetPage.saveTimesheet();

  // --------------------------------------------------------------------------
  // 6. VALIDACIONES DEL RESULTADO ESPERADO
  // --------------------------------------------------------------------------

  // El sistema debe mostrar una validación asociada al campo de horas.
  await expect(timesheetPage.getHoursValidationMessage()).toBeVisible();

  // La operación inválida no debe permitir abandonar la pantalla de edición.
  await expect(page).toHaveURL(/editTimesheet/);
});
