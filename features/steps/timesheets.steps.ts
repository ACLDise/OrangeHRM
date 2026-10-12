import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

import { LoginPage } from "../../pages/LoginPage";
import { TimesheetPage } from "../../pages/TimesheetPage";

// ============================================================================
// STEP DEFINITIONS - HU-TIM-001
// ============================================================================

// createBdd permite relacionar las instrucciones escritas en Gherkin
// con las acciones automatizadas mediante Playwright.
const { Given, When, Then } = createBdd();

// ============================================================================
// CONFIGURACIÓN DEL AMBIENTE
// ============================================================================

const URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

const USERNAME = "Admin";
const PASSWORD = "admin123";
const PROJECT = "ACME Ltd";
const ACTIVITY = "Administration";

// ============================================================================
// GIVEN - PRECONDICIONES
// ============================================================================

/**-------------------------------------------------------------------------------------------
 * Implementa el paso: Autenticación de usuario en OrangeHRM
 ----------------------------------------------------------------------------------------------*/
Given("que el usuario está autenticado en OrangeHRM", async ({ page }) => {
  // Inicializamos el Page Object encargado del Login.
  const loginPage = new LoginPage(page);

  // Accedemos al ambiente de pruebas.
  await page.goto(URL);

  // Ejecutamos el inicio de sesión.
  await loginPage.login(USERNAME, PASSWORD);

  // Confirmamos que la autenticación fue exitosa.
  await expect(page).toHaveURL(/dashboard/);
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And tiene acceso a la edición de su hoja de tiempo
 ----------------------------------------------------------------------------------------------*/
Given("tiene acceso a la edición de su hoja de tiempo", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Navegamos desde el Dashboard hasta la edición de My Timesheet.
  await timesheetPage.openMyTimesheetForEditing();

  // Confirmamos que el usuario llegó correctamente
  // a la pantalla de edición de la hoja de tiempo.
  await expect(page).toHaveURL(/editTimesheet/);
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And existen un proyecto y una actividad válidos disponibles
 ----------------------------------------------------------------------------------------------*/
Given(
  "existen un proyecto y una actividad válidos disponibles",
  async ({ page }) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Seleccionamos un proyecto válido disponible en OrangeHRM.
    await timesheetPage.selectProject(PROJECT);

    // Seleccionamos una actividad válida asociada al proyecto.
    await timesheetPage.selectActivity(ACTIVITY);
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And existe un proyecto válido disponible
 *----------------------------------------------------------------------------------------------*/
Given("existe un proyecto válido disponible", async () => {
  // Verificamos que el proyecto utilizado como dato de prueba
  // se encuentre definido antes de continuar con el escenario.
  expect(PROJECT).not.toBe("");
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And existe una hoja de tiempo en estado Submitted disponible para aprobación
 *----------------------------------------------------------------------------------------------*/
Given(
  "existe una hoja de tiempo en estado Submitted disponible para aprobación",
  async () => {
    // Esta precondición quedará conectada posteriormente con la lógica
    // necesaria para localizar o preparar una Timesheet en estado Submitted.
    throw new Error(
      "Step pendiente de conectar con una Timesheet en estado Submitted",
    );
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And accede a la hoja de tiempo del empleado indicado
 *----------------------------------------------------------------------------------------------*/
Given(
  'accede a la hoja de tiempo del empleado "{string}"',
  async ({ page }, employeeName: string) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Accedemos a la hoja de tiempo del empleado indicado.
    await timesheetPage.openEmployeeTimesheet(employeeName);
  },
);

// ============================================================================
// WHEN - ACCIONES
// ============================================================================

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: When intenta guardar horas asociadas a un proyecto y actividad válidos
 ----------------------------------------------------------------------------------------------*/
When(
  "intenta guardar {int} horas asociadas a un proyecto y actividad válidos",
  async ({ page }, hours: number) => {
    const timesheetPage = new TimesheetPage(page);

    await timesheetPage.enterHours(0, String(hours));
    await timesheetPage.saveTimesheet();
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: When registra horas asociadas a un proyecto y actividad válidos
 *----------------------------------------------------------------------------------------------*/
When(
  "registra {int} horas asociadas a un proyecto y actividad válidos",
  async ({ page }, hours: number) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Registramos el valor de horas recibido desde el Scenario Outline.
    await timesheetPage.enterHours(0, String(hours));
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And guarda la hoja de tiempo
 *----------------------------------------------------------------------------------------------*/
When("guarda la hoja de tiempo", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Guardamos la información registrada en la hoja de tiempo.
  await timesheetPage.saveTimesheet();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: When registra 8 horas sin seleccionar proyecto ni actividad
 *----------------------------------------------------------------------------------------------*/
When(
  "registra 8 horas sin seleccionar proyecto ni actividad",
  async ({ page }) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Creamos una nueva fila para garantizar que Project y Activity
    // comiencen vacíos y no dependan de información previa.
    await timesheetPage.addNewRow();

    // Registramos una cantidad válida de horas en la nueva fila,
    // dejando Project y Activity sin seleccionar.
    await timesheetPage.enterHoursInLastRow(0, "8");
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And intenta guardar la hoja de tiempo
 *----------------------------------------------------------------------------------------------*/
When("intenta guardar la hoja de tiempo", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Intentamos guardar la hoja de tiempo con la información registrada.
  await timesheetPage.saveTimesheet();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: When selecciona un proyecto válido
 *----------------------------------------------------------------------------------------------*/
When("selecciona un proyecto válido", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Creamos una nueva fila para garantizar que Activity
  // comience sin información previa.
  await timesheetPage.addNewRow();

  // Seleccionamos el proyecto válido en la nueva fila.
  await timesheetPage.selectProjectInLastRow(PROJECT);
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And registra 8 horas sin seleccionar una actividad
 *----------------------------------------------------------------------------------------------*/
When("registra 8 horas sin seleccionar una actividad", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Registramos una cantidad válida de horas en la última fila,
  // manteniendo Activity sin seleccionar.
  await timesheetPage.enterHoursInLastRow(0, "8");
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: When aprueba la hoja de tiempo
 *----------------------------------------------------------------------------------------------*/
When("aprueba la hoja de tiempo", async () => {
  // Esta acción quedará conectada posteriormente con la operación
  // de aprobación de una Timesheet en estado Submitted.
  throw new Error(
    "Step pendiente de conectar con la acción Approve de TimesheetPage",
  );
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And envía la hoja de tiempo para aprobación
 *----------------------------------------------------------------------------------------------*/
When("envía la hoja de tiempo para aprobación", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Enviamos la hoja de tiempo registrada para aprobación.
  await timesheetPage.submitTimesheet();
});

// ============================================================================
// THEN - VALIDACIONES
// ============================================================================

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe rechazar el valor negativo
 ----------------------------------------------------------------------------------------------*/
Then("el sistema debe rechazar el valor negativo", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Verificamos que OrangeHRM haya rechazado el valor negativo
  // mostrando la validación correspondiente en el campo de horas.
  await expect(timesheetPage.getHoursValidationMessage()).toBeVisible();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And debe mostrar un mensaje de validación en el campo de horas
 ----------------------------------------------------------------------------------------------*/
Then(
  "debe mostrar un mensaje de validación en el campo de horas",
  async ({ page }) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Verificamos que el mensaje de validación del campo de horas
    // permanezca visible después del intento de guardado.
    await expect(timesheetPage.getHoursValidationMessage()).toBeVisible();
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And debe permanecer en la pantalla de edición de la hoja de tiempo
 ----------------------------------------------------------------------------------------------*/
Then(
  "debe permanecer en la pantalla de edición de la hoja de tiempo",
  async ({ page }) => {
    // Verificamos que el sistema permanezca en la pantalla de edición
    // después de rechazar el valor ingresado.
    await expect(page).toHaveURL(/editTimesheet/);
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe aceptar el valor registrado
 *----------------------------------------------------------------------------------------------*/
Then("el sistema debe aceptar el valor registrado", async ({ page }) => {
  // Verificamos que el guardado haya sido aceptado
  // y el sistema haya regresado a la vista de My Timesheet.
  await expect(page).toHaveURL(/viewMyTimesheet/);
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And no debe mostrar mensajes de validación en el campo de horas
 *----------------------------------------------------------------------------------------------*/
Then(
  "no debe mostrar mensajes de validación en el campo de horas",
  async ({ page }) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Verificamos que no se muestre el mensaje de validación
    // asociado a valores inválidos en el campo de horas.
    await expect(timesheetPage.getHoursValidationMessage()).toBeHidden();
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe rechazar el valor ingresado
 *----------------------------------------------------------------------------------------------*/
Then("el sistema debe rechazar el valor ingresado", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Verificamos que OrangeHRM haya rechazado el valor ingresado
  // mostrando la validación correspondiente en el campo de horas.
  await expect(timesheetPage.getHoursValidationMessage()).toBeVisible();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe impedir el guardado
 *----------------------------------------------------------------------------------------------*/
Then("el sistema debe impedir el guardado", async ({ page }) => {
  // Verificamos que el sistema permanezca en la pantalla de edición,
  // lo que confirma que el guardado no fue completado.
  await expect(page).toHaveURL(/editTimesheet/);
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And debe indicar que el proyecto es obligatorio
 *----------------------------------------------------------------------------------------------*/
Then("debe indicar que el proyecto es obligatorio", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Verificamos que OrangeHRM muestre el mensaje de validación
  // correspondiente al campo Project.
  await expect(timesheetPage.getProjectValidationMessage()).toBeVisible();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And debe indicar que la actividad es obligatoria
 *----------------------------------------------------------------------------------------------*/
Then("debe indicar que la actividad es obligatoria", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Verificamos que OrangeHRM muestre el mensaje de validación
  // correspondiente al campo Activity.
  await expect(timesheetPage.getActivityValidationMessage()).toBeVisible();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe aceptar el envío de la hoja de tiempo
 *----------------------------------------------------------------------------------------------*/
Then(
  "el sistema debe aceptar el envío de la hoja de tiempo",
  async ({ page }) => {
    // Inicializamos el Page Object correspondiente a Timesheets.
    const timesheetPage = new TimesheetPage(page);

    // Verificamos que el envío haya sido aceptado
    // comprobando que la hoja de tiempo se encuentre en estado Submitted.
    await expect(timesheetPage.getTimesheetStatus("Submitted")).toBeVisible();
  },
);

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And la hoja de tiempo debe quedar en estado Submitted
 *----------------------------------------------------------------------------------------------*/
Then("la hoja de tiempo debe quedar en estado Submitted", async ({ page }) => {
  // Inicializamos el Page Object correspondiente a Timesheets.
  const timesheetPage = new TimesheetPage(page);

  // Confirmamos que el estado final mostrado por OrangeHRM
  // corresponde a Submitted.
  await expect(timesheetPage.getTimesheetStatus("Submitted")).toBeVisible();
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: Then el sistema debe aceptar la aprobación
 *----------------------------------------------------------------------------------------------*/
Then("el sistema debe aceptar la aprobación", async () => {
  // Esta validación quedará conectada posteriormente con el resultado
  // observable generado después de aprobar la Timesheet.
  throw new Error(
    "Step pendiente de conectar con la validación de aprobación de Timesheet",
  );
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And la hoja de tiempo debe quedar en estado Approved
 *----------------------------------------------------------------------------------------------*/
Then("la hoja de tiempo debe quedar en estado Approved", async () => {
  // Esta validación quedará conectada posteriormente con el estado
  // mostrado por OrangeHRM después de aprobar la Timesheet.
  throw new Error(
    "Step pendiente de conectar con la validación del estado Approved",
  );
});

/**----------------------------------------------------------------------------------------------
 * Implementa el paso: And no debe permitir modificar las horas registradas
 *----------------------------------------------------------------------------------------------*/
Then("no debe permitir modificar las horas registradas", async () => {
  // Esta validación quedará conectada posteriormente con la comprobación
  // de que los campos de horas no puedan ser editados después de aprobar
  // la Timesheet.
  throw new Error(
    "Step pendiente de conectar con la validación de bloqueo de horas",
  );
});
