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
// DATOS DE PRUEBA - CP-TIM-002
// ============================================================================

// Proyecto y actividad válidos utilizados durante la prueba.
const PROJECT = "ACME Ltd";
const ACTIVITY = "Administration";

// Valores válidos definidos para CP-TIM-002.
//
// Cada valor será ejecutado como una prueba independiente,
// reproduciendo el comportamiento del Scenario Outline de Gherkin.
const VALID_HOURS = ["0", "8", "24"];

// ============================================================================
// CASO DE PRUEBA PARAMETRIZADO
// ============================================================================

// Recorremos cada valor definido en VALID_HOURS.
//
// Esto evita duplicar el mismo caso de prueba tres veces.
// Para cada valor Playwright generará una ejecución independiente.
for (const hours of VALID_HOURS) {
  test(`CP-TIM-002 - Registrar ${hours} horas válidas`, async ({ page }) => {
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

    // Ingresamos el valor negativo en el primer día de la semana.
    await timesheetPage.enterHours(0, hours);

    // Confirmamos que el dato de prueba haya sido ingresado en el campo esperado.
    await expect(timesheetPage.getHoursInput(0)).toHaveValue(hours);

    // Intentamos guardar la hoja de tiempo con el valor inválido.
    await timesheetPage.saveTimesheet();
  });
}
