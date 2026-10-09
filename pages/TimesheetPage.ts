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
}
