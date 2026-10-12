import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TimesheetPage } from "../pages/TimesheetPage";

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

const USERNAME = "Admin";
const PASSWORD = "admin123";

const EMPLOYEE = "Timothy Lewis Amiano";
const PROJECT = "ACME Ltd";
const ACTIVITY = "Administration";

// ============================================================================
// CP-TIM-007 - REGISTRAR Y ENVIAR HOJA DE TIEMPO VÁLIDA
// ============================================================================

test.describe("CP-TIM-007 - Registrar y enviar correctamente una hoja de tiempo semanal", () => {
  test("Debe registrar 8 horas y enviar la hoja de tiempo para aprobación", async ({
    page,
  }) => {
    // --------------------------------------------------------------------
    // 1. Inicialización de los Page Objects
    // --------------------------------------------------------------------

    const loginPage = new LoginPage(page);
    const timesheetPage = new TimesheetPage(page);

    // --------------------------------------------------------------------
    // 2. Autenticación
    // --------------------------------------------------------------------

    await page.goto(URL);

    await loginPage.login(USERNAME, PASSWORD);

    // Verificamos que el inicio de sesión sea exitoso.
    await expect(page).toHaveURL(/dashboard/);

    // --------------------------------------------------------------------
    // 3. Acceso a la hoja de tiempo del empleado
    // --------------------------------------------------------------------

    await timesheetPage.openEmployeeTimesheet(EMPLOYEE);

    // --------------------------------------------------------------------
    // 4. Preparación de la hoja de tiempo
    // --------------------------------------------------------------------

    // Preparamos la Timesheet para garantizar que se encuentre
    // en un estado que permita editarla y enviarla nuevamente.
    await timesheetPage.prepareTimesheetForSubmission();

    // --------------------------------------------------------------------
    // 5. Selección de Project y Activity
    // --------------------------------------------------------------------

    await timesheetPage.selectProject(PROJECT);

    await timesheetPage.selectActivity(ACTIVITY);

    // --------------------------------------------------------------------
    // 6. Registro de horas
    // --------------------------------------------------------------------

    // Registramos 8 horas en el primer día disponible
    // de la hoja de tiempo.
    await timesheetPage.enterHours(0, "8");

    // --------------------------------------------------------------------
    // 7. Guardado de la hoja de tiempo
    // --------------------------------------------------------------------

    await timesheetPage.saveTimesheet();

    // --------------------------------------------------------------------
    // 8. Envío de la hoja de tiempo para aprobación
    // --------------------------------------------------------------------

    await timesheetPage.submitTimesheet();

    // --------------------------------------------------------------------
    // 9. Validación del resultado esperado
    // --------------------------------------------------------------------

    // Verificamos que OrangeHRM haya procesado correctamente
    // el envío y que la hoja quede en estado Submitted.
    await expect(timesheetPage.getTimesheetStatus("Submitted")).toBeVisible();
  });
});
