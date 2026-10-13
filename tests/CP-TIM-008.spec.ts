import { test, expect } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { TimesheetPage } from "../pages/TimesheetPage";

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

// URL de acceso al ambiente demo de OrangeHRM.
const URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

// Credenciales utilizadas para autenticarse en el ambiente de pruebas.
const USERNAME = "Admin";
const PASSWORD = "admin123";

// Empleado utilizado para consultar la hoja de tiempo.
const EMPLOYEE = "Timothy Lewis Amiano";

// Comentario utilizado durante la aprobación de la Timesheet.
const ACTION_COMMENT = "Prueba CP-TIM-008";

// ============================================================================
// CP-TIM-008 - APROBAR UNA HOJA DE TIEMPO ENVIADA
// ============================================================================

test.describe("CP-TIM-008 - Aprobar correctamente una hoja de tiempo enviada", () => {
  test("Debe aprobar una hoja de tiempo en estado Submitted", async ({
    page,
  }) => {
    // --------------------------------------------------------------------
    // 1. INICIALIZACIÓN DE PAGE OBJECTS
    // --------------------------------------------------------------------

    const loginPage = new LoginPage(page);
    const timesheetPage = new TimesheetPage(page);

    // --------------------------------------------------------------------
    // 2. AUTENTICACIÓN
    // --------------------------------------------------------------------

    await page.goto(URL);

    await loginPage.login(USERNAME, PASSWORD);

    // Confirmamos que el inicio de sesión fue exitoso.
    await expect(page).toHaveURL(/dashboard/);

    // --------------------------------------------------------------------
    // 3. ACCESO A LA HOJA DE TIEMPO DEL EMPLEADO
    // --------------------------------------------------------------------

    // Navegamos hasta Employee Timesheets y consultamos
    // la hoja correspondiente al empleado utilizado en la prueba.
    await timesheetPage.openEmployeeTimesheet(EMPLOYEE);

    // --------------------------------------------------------------------
    // 4. PREPARACIÓN DE LA HOJA DE TIEMPO
    // --------------------------------------------------------------------

    // Garantizamos que la Timesheet se encuentre en estado Submitted
    // antes de ejecutar el flujo de aprobación.
    //
    // Este método permite manejar estados previos provenientes
    // de ejecuciones anteriores del ambiente demo.
    await timesheetPage.prepareTimesheetForApproval();

    // --------------------------------------------------------------------
    // 5. REGISTRO DEL COMENTARIO DE APROBACIÓN
    // --------------------------------------------------------------------

    // Registramos el comentario asociado a la acción
    // que será ejecutada sobre la Timesheet.
    await timesheetPage.enterTimesheetActionComment(ACTION_COMMENT);

    // --------------------------------------------------------------------
    // 6. APROBACIÓN DE LA HOJA DE TIEMPO
    // --------------------------------------------------------------------

    // Ejecutamos la acción Approve sobre la Timesheet
    // previamente preparada en estado Submitted.
    await timesheetPage.approveTimesheet();

    // --------------------------------------------------------------------
    // 7. VALIDACIÓN DEL ESTADO FINAL
    // --------------------------------------------------------------------

    // Confirmamos que OrangeHRM procesó correctamente
    // la aprobación y cambió el estado a Approved.
    await expect(timesheetPage.getTimesheetStatus("Approved")).toBeVisible();

    // --------------------------------------------------------------------
    // 8. VALIDACIÓN DEL HISTORIAL DE ACCIONES
    // --------------------------------------------------------------------

    // Verificamos que la acción Approved haya sido registrada
    // dentro de Actions Performed on the Timesheet.
    await expect(
      timesheetPage.getTimesheetHistoryAction("Approved"),
    ).toBeVisible();

    // --------------------------------------------------------------------
    // 9. VALIDACIÓN DEL BLOQUEO DE EDICIÓN
    // --------------------------------------------------------------------

    // Después de aprobar la Timesheet, OrangeHRM no debe
    // permitir nuevamente el acceso al modo de edición.
    await expect(timesheetPage.getEditButton()).toBeHidden();
  });
});
