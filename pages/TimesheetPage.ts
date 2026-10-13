import { Page, Locator } from "@playwright/test";

/**
 * Page Object del módulo Time / Timesheets.
 * Centraliza los elementos y acciones reutilizables sobre una hoja de tiempo.
 */
export class TimesheetPage {
  // ===========================================================================
  // LOCATORS DE NAVEGACIÓN
  // ===========================================================================

  // Opción Time ubicada en el menú lateral principal.
  private readonly timeMenu: Locator;

  // Menú desplegable Timesheets del módulo Time.
  private readonly timesheetsMenu: Locator;

  // Opción My Timesheets dentro del menú Timesheets.
  private readonly myTimesheetsOption: Locator;

  // Botón que permite editar la hoja de tiempo.
  private readonly editButton: Locator;

  // ===========================================================================
  // LOCATORS DE LA TIMESHEET
  // ===========================================================================

  // Campo Project de la primera fila editable.
  private readonly projectInput: Locator;

  // Campo Activity de la primera fila editable.
  private readonly activityDropdown: Locator;

  // Campos de horas disponibles en la Timesheet.
  private readonly hourInputs: Locator;

  // Botón utilizado para agregar una nueva fila.
  private readonly addRowButton: Locator;

  // Filas editables de la Timesheet.
  private readonly timesheetRows: Locator;

  // Botón utilizado para guardar los cambios.
  private readonly saveButton: Locator;

  // Botón utilizado para enviar la hoja de tiempo para aprobación.
  private readonly submitButton: Locator;

  // ===========================================================================
  // LOCATORS DE VALIDACIÓN
  // ===========================================================================

  // Mensaje mostrado cuando el valor de horas no es válido.
  private readonly hoursValidationMessage: Locator;

  // Mensaje mostrado cuando Project es obligatorio.
  private readonly projectValidationMessage: Locator;

  // Mensaje mostrado cuando Activity es obligatoria.
  private readonly activityValidationMessage: Locator;

  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================

  constructor(private readonly page: Page) {
    // -------------------------------------------------------------------------
    // Navegación
    // -------------------------------------------------------------------------

    this.timeMenu = page.getByRole("link", {
      name: "Time",
    });

    this.timesheetsMenu = page
      .locator(".oxd-topbar-body-nav-tab-item")
      .filter({ hasText: "Timesheets" });

    this.myTimesheetsOption = page.getByRole("menuitem", {
      name: "My Timesheets",
    });

    this.editButton = page.getByRole("button", {
      name: "Edit",
    });

    // -------------------------------------------------------------------------
    // Elementos de edición
    // -------------------------------------------------------------------------

    // Primera coincidencia del campo Project.
    // Los casos CP-TIM-001, CP-TIM-002 y CP-TIM-003 trabajan
    // principalmente sobre la primera fila.
    this.projectInput = page.getByPlaceholder("Type for hints...").first();

    // Primera coincidencia del desplegable Activity.
    this.activityDropdown = page.locator(".oxd-select-text-input").first();

    // Campos de horas disponibles dentro de la tabla.
    this.hourInputs = page.locator(
      ".orangehrm-timesheet-table-body input.oxd-input",
    );

    // Botón Add Row identificado mediante el icono "+".
    this.addRowButton = page.locator("button.orangehrm-timesheet-icon").filter({
      has: page.locator("i.bi-plus"),
    });

    // Se consideran únicamente las filas que contienen un campo Project.
    // Esto permite excluir elementos estructurales de la tabla y trabajar
    // solamente con filas editables.
    this.timesheetRows = page
      .locator(".orangehrm-timesheet-table-body-row")
      .filter({
        has: page.locator('input[placeholder="Type for hints..."]'),
      });

    this.saveButton = page.getByRole("button", {
      name: "Save",
    });

    this.submitButton = page.getByRole("button", {
      name: "Submit",
    });

    // -------------------------------------------------------------------------
    // Mensajes de validación
    // -------------------------------------------------------------------------

    this.hoursValidationMessage = page.getByText(
      "Should Be Less Than 24 and in HH:MM or Decimal Format",
      { exact: true },
    );

    this.projectValidationMessage = page.getByText("Select a Project", {
      exact: true,
    });

    this.activityValidationMessage = page.getByText("Select an Activity", {
      exact: true,
    });
  }

  // ===========================================================================
  // NAVEGACIÓN
  // ===========================================================================

  /**
   * Navega desde el Dashboard hasta la pantalla de edición de My Timesheet.
   */
  async openMyTimesheetForEditing(): Promise<void> {
    await this.timeMenu.click();
    await this.timesheetsMenu.click();
    await this.myTimesheetsOption.click();
    await this.editButton.click();
  }

  /**
   * Navega hasta Employee Timesheets, busca al empleado indicado
   * y consulta su hoja de tiempo.
   */
  async openEmployeeTimesheet(employeeName: string): Promise<void> {
    // Ingresamos al módulo Time.
    await this.timeMenu.click();

    // Abrimos el menú Timesheets.
    await this.timesheetsMenu.click();

    // Seleccionamos la opción Employee Timesheets.
    await this.page
      .getByRole("menuitem", { name: "Employee Timesheets" })
      .click();

    // Localizamos el campo Employee Name.
    const employeeInput = this.page.getByPlaceholder("Type for hints...");

    // Ingresamos el nombre del empleado.
    await employeeInput.fill(employeeName);

    // Esperamos a que OrangeHRM muestre el empleado
    // dentro de las opciones del autocomplete.
    const employeeOption = this.page
      .locator(".oxd-autocomplete-option")
      .filter({ hasText: employeeName })
      .first();

    await employeeOption.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Seleccionamos el empleado encontrado.
    await employeeOption.click();

    // Consultamos la hoja de tiempo del empleado.
    // Limitamos la búsqueda al formulario de Employee Timesheets
    // para evitar confundir este botón View con los botones de la tabla.
    await this.page
      .locator("form")
      .getByRole("button", { name: "View", exact: true })
      .click();
  }

  /**
   * Prepara la hoja de tiempo para ejecutar un nuevo flujo de envío.
   *
   * El objetivo es garantizar que la Timesheet quede en estado Rejected,
   * ya que desde este estado OrangeHRM permite editar la información
   * y posteriormente ejecutar nuevamente la acción Submit.
   */
  async prepareTimesheetForSubmission(): Promise<void> {
    // Esperamos a que OrangeHRM muestre alguno de los estados
    // asociados a la hoja de tiempo consultada.
    const statusLabel = this.page
      .locator("p.oxd-text--subtitle-2")
      .filter({
        hasText: /^Status:\s*(Not Submitted|Submitted|Rejected|Approved)$/,
      })
      .first();

    await statusLabel.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Consultamos el estado actual de la Timesheet.
    let currentStatus = (await statusLabel.textContent())?.trim() ?? "";

    // -------------------------------------------------------------------------
    // ESTADO APPROVED
    // -------------------------------------------------------------------------
    //
    // Una Timesheet aprobada no puede enviarse nuevamente directamente.
    // Primero ejecutamos Reset, lo que devuelve la hoja a Submitted.
    //
    if (currentStatus === "Status: Approved") {
      const resetButton = this.page.getByRole("button", {
        name: "Reset",
        exact: true,
      });

      await resetButton.waitFor({
        state: "visible",
        timeout: 15000,
      });

      await resetButton.click();

      // Esperamos explícitamente la transición:
      // Approved → Submitted.
      await this.getTimesheetStatus("Submitted").waitFor({
        state: "visible",
        timeout: 15000,
      });

      currentStatus = "Status: Submitted";
    }

    // -------------------------------------------------------------------------
    // ESTADO SUBMITTED
    // -------------------------------------------------------------------------
    //
    // Una Timesheet Submitted debe rechazarse para permitir
    // nuevamente el flujo de edición y envío.
    //
    if (currentStatus === "Status: Submitted") {
      const rejectButton = this.page.getByRole("button", {
        name: "Reject",
        exact: true,
      });

      await rejectButton.waitFor({
        state: "visible",
        timeout: 15000,
      });

      await rejectButton.click();

      // Esperamos explícitamente la transición:
      // Submitted → Rejected.
      await this.getTimesheetStatus("Rejected").waitFor({
        state: "visible",
        timeout: 15000,
      });
    }

    // -------------------------------------------------------------------------
    // ESTADO REJECTED
    // -------------------------------------------------------------------------
    //
    // Una vez garantizado el estado Rejected,
    // abrimos la Timesheet en modo edición.
    //
    await this.editButton.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await this.editButton.click();

    // Confirmamos que OrangeHRM haya ingresado realmente
    // a la pantalla de edición antes de continuar.
    await this.page.waitForURL(/editTimesheet/, {
      timeout: 15000,
    });
  }

  /**
   * Prepara la hoja de tiempo para ejecutar el flujo de aprobación.
   *
   * El objetivo es garantizar que la Timesheet se encuentre
   * en estado Submitted antes de ejecutar la acción Approve.
   */
  async prepareTimesheetForApproval(): Promise<void> {
    // Esperamos a que OrangeHRM muestre el estado actual
    // de la hoja de tiempo consultada.
    const statusLabel = this.page
      .locator("p:visible")
      .filter({
        hasText: /^Status:/,
      })
      .first();

    await statusLabel.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Consultamos el estado actual de la Timesheet.
    let currentStatus = (await statusLabel.textContent())?.trim() ?? "";

    // -------------------------------------------------------------------------
    // ESTADO APPROVED
    // -------------------------------------------------------------------------
    //
    // Si la hoja se encuentra aprobada, ejecutamos Reset.
    // De acuerdo con el comportamiento observado en OrangeHRM,
    // esta acción devuelve la hoja al estado Submitted.
    //
    if (currentStatus === "Status: Approved") {
      const resetButton = this.page.getByRole("button", {
        name: "Reset",
        exact: true,
      });

      await resetButton.waitFor({
        state: "visible",
        timeout: 15000,
      });

      await resetButton.click();

      // Esperamos explícitamente la transición:
      // Approved → Submitted.
      await this.getTimesheetStatus("Submitted").waitFor({
        state: "visible",
        timeout: 15000,
      });

      currentStatus = "Status: Submitted";
    }

    // -------------------------------------------------------------------------
    // ESTADO REJECTED
    // -------------------------------------------------------------------------
    //
    // Si la hoja se encuentra rechazada, ejecutamos Submit
    // para enviarla nuevamente a aprobación.
    //
    if (currentStatus === "Status: Rejected") {
      await this.submitButton.waitFor({
        state: "visible",
        timeout: 15000,
      });

      await this.submitButton.click();

      // Esperamos explícitamente la transición:
      // Rejected → Submitted.
      await this.getTimesheetStatus("Submitted").waitFor({
        state: "visible",
        timeout: 15000,
      });

      currentStatus = "Status: Submitted";
    }

    // -------------------------------------------------------------------------
    // VALIDACIÓN FINAL
    // -------------------------------------------------------------------------
    //
    // Confirmamos que la hoja quedó realmente en Submitted
    // antes de continuar con el flujo de aprobación.
    //
    if (currentStatus !== "Status: Submitted") {
      throw new Error(
        `No fue posible preparar la Timesheet para aprobación. Estado actual: ${currentStatus}`,
      );
    }
  }

  // ===========================================================================
  // ACCIONES SOBRE LA PRIMERA FILA
  // ===========================================================================

  /**
   * Busca y selecciona un proyecto en la primera fila editable.
   */
  async selectProject(projectName: string): Promise<void> {
    // Consultamos el proyecto actualmente seleccionado.
    const currentProject = await this.projectInput.inputValue();

    // Si el proyecto requerido ya está seleccionado,
    // evitamos realizar nuevamente la búsqueda.
    if (currentProject.includes(projectName)) {
      return;
    }

    await this.projectInput.click();
    await this.projectInput.fill(projectName);

    // OrangeHRM genera dinámicamente las opciones del autocomplete.
    const projectOption = this.page
      .locator(".oxd-autocomplete-option")
      .filter({ hasText: projectName })
      .first();

    await projectOption.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await projectOption.click();
  }

  /**
   * Selecciona una actividad en la primera fila editable.
   */
  async selectActivity(activityName: string): Promise<void> {
    const currentActivity = (await this.activityDropdown.textContent()) ?? "";

    // Evitamos seleccionar nuevamente una actividad
    // que ya se encuentre diligenciada.
    if (currentActivity.includes(activityName)) {
      return;
    }

    await this.activityDropdown.click();

    const activityOption = this.page.getByText(activityName, {
      exact: true,
    });

    await activityOption.waitFor({
      state: "visible",
      timeout: 10000,
    });

    await activityOption.click();
  }

  /**
   * Ingresa un valor de horas en el día indicado de la primera fila.
   *
   * dayIndex:
   * 0 = lunes
   * 1 = martes
   * 2 = miércoles
   * 3 = jueves
   * 4 = viernes
   * 5 = sábado
   * 6 = domingo
   */
  async enterHours(dayIndex: number, hours: string): Promise<void> {
    await this.getHoursInput(dayIndex).fill(hours);
  }

  // ===========================================================================
  // ACCIONES GENERALES
  // ===========================================================================

  /**
   * Intenta guardar los datos registrados en la hoja de tiempo.
   */
  async saveTimesheet(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Envía la hoja de tiempo registrada para aprobación.
   */
  async submitTimesheet(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Registra un comentario en el campo Timesheet Action.
   *
   * Este comentario queda asociado a la acción posteriormente
   * ejecutada sobre la hoja de tiempo, por ejemplo Approve o Reject.
   */
  async enterTimesheetActionComment(comment: string): Promise<void> {
    // Localizamos el campo de texto utilizado para registrar
    // observaciones asociadas a las acciones de la Timesheet.
    const actionComment = this.page.getByPlaceholder("Type here ...");

    // Registramos el comentario recibido como dato de prueba.
    await actionComment.fill(comment);
  }

  /**
   * Aprueba la hoja de tiempo actualmente enviada.
   */
  async approveTimesheet(): Promise<void> {
    // Localizamos el botón Approve disponible cuando
    // la Timesheet se encuentra en estado Submitted.
    const approveButton = this.page.getByRole("button", {
      name: "Approve",
      exact: true,
    });

    // Esperamos a que la acción de aprobación esté disponible.
    await approveButton.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Ejecutamos la aprobación de la hoja de tiempo.
    await approveButton.click();
  }

  /**
   * Agrega una nueva fila vacía y espera hasta que OrangeHRM
   * la incorpore a la tabla.
   */
  async addNewRow(): Promise<void> {
    // Número de filas existentes antes de agregar una nueva.
    const previousRowCount = await this.timesheetRows.count();

    // Agregamos una nueva fila.
    await this.addRowButton.click();

    // Esperamos específicamente a que la nueva fila sea visible.
    await this.timesheetRows.nth(previousRowCount).waitFor({
      state: "visible",
      timeout: 10000,
    });
  }

  // ===========================================================================
  // ACCIONES SOBRE LA ÚLTIMA FILA AGREGADA
  // ===========================================================================

  /**
   * Selecciona un proyecto en la última fila agregada.
   */
  async selectProjectInLastRow(projectName: string): Promise<void> {
    // Localizamos Project únicamente dentro de la última fila.
    const projectInput =
      this.getLastRow().getByPlaceholder("Type for hints...");

    await projectInput.click();
    await projectInput.fill(projectName);

    const projectOption = this.page
      .locator(".oxd-autocomplete-option")
      .filter({ hasText: projectName })
      .first();

    await projectOption.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await projectOption.click();
  }

  /**
   * Selecciona una actividad en la última fila agregada.
   */
  async selectActivityInLastRow(activityName: string): Promise<void> {
    // Localizamos Activity únicamente dentro de la última fila.
    const activityDropdown = this.getLastRow().locator(
      ".oxd-select-text-input",
    );

    await activityDropdown.click();

    const activityOption = this.page.getByText(activityName, {
      exact: true,
    });

    await activityOption.waitFor({
      state: "visible",
      timeout: 10000,
    });

    await activityOption.click();
  }

  /**
   * Ingresa horas en un día específico de la última fila agregada.
   *
   * dayIndex:
   * 0 = lunes
   * 1 = martes
   * 2 = miércoles
   * 3 = jueves
   * 4 = viernes
   * 5 = sábado
   * 6 = domingo
   */
  async enterHoursInLastRow(dayIndex: number, hours: string): Promise<void> {
    await this.getHoursInputInLastRow(dayIndex).fill(hours);
  }

  // ===========================================================================
  // ELEMENTOS DE LA TIMESHEET
  // ===========================================================================

  /**
   * Retorna la última fila editable disponible.
   */
  getLastRow(): Locator {
    return this.timesheetRows.last();
  }

  /**
   * Retorna el campo de horas correspondiente al día solicitado
   * dentro de la primera fila.
   */
  getHoursInput(dayIndex: number): Locator {
    return this.hourInputs.nth(dayIndex);
  }

  /**
   * Retorna el campo de horas correspondiente al día solicitado
   * dentro de la última fila agregada.
   */
  getHoursInputInLastRow(dayIndex: number): Locator {
    return this.getLastRow().locator("input.oxd-input").nth(dayIndex);
  }

  // ===========================================================================
  // ELEMENTOS PARA VALIDACIÓN
  // ===========================================================================

  /**
   * Retorna el mensaje de validación asociado al campo de horas.
   */
  getHoursValidationMessage(): Locator {
    return this.hoursValidationMessage;
  }

  /**
   * Retorna el mensaje de validación asociado a Project.
   */
  getProjectValidationMessage(): Locator {
    return this.projectValidationMessage;
  }

  /**
   * Retorna el mensaje de validación asociado a Activity.
   */
  getActivityValidationMessage(): Locator {
    return this.activityValidationMessage;
  }

  /**
   * Retorna el mensaje de validación de Project correspondiente
   * específicamente a la última fila agregada.
   */
  getProjectValidationMessageInLastRow(): Locator {
    return this.getLastRow().getByText("Select a Project", { exact: true });
  }

  /**
   * Retorna el mensaje de validación de Activity correspondiente
   * específicamente a la última fila agregada.
   */
  getActivityValidationMessageInLastRow(): Locator {
    return this.getLastRow().getByText("Select an Activity", { exact: true });
  }

  /**
   * Retorna el estado actual mostrado para la hoja de tiempo.
   * Ejemplos: Submitted - Approved
   */
  getTimesheetStatus(status: string): Locator {
    return this.page.getByText(`Status: ${status}`, {
      exact: true,
    });
  }

  getTimesheetHistoryAction(action: string): Locator {
    // OrangeHRM puede conservar varias acciones iguales en el historial
    // debido a ejecuciones anteriores de la misma Timesheet.
    // Tomamos una coincidencia visible para comprobar que la acción
    // se encuentra registrada en el historial.
    return this.page
      .getByText(action, {
        exact: true,
      })
      .first();
  }

  /**
   * Retorna el botón Edit de la hoja de tiempo.
   * Permite validar si la Timesheet puede o no ser modificada
   * según su estado actual.
   */
  getEditButton(): Locator {
    return this.editButton;
  }
}
