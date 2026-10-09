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

  // Campo autocomplete utilizado para seleccionar un proyecto.
  private readonly projectInput: Locator;

  // Campo desplegable utilizado para seleccionar una actividad.
  private readonly activityDropdown: Locator;

  // Campos destinados al registro de horas por día.
  private readonly hourInputs: Locator;

  // Botón utilizado para guardar los cambios realizados.
  private readonly saveButton: Locator;

  // Mensaje mostrado cuando el valor ingresado en horas no es válido.
  private readonly hoursValidationMessage: Locator;

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
    // Elementos de edición de la Timesheet
    // -------------------------------------------------------------------------

    this.projectInput = page.getByPlaceholder("Type for hints...");

    // Se localiza el componente desplegable utilizado para Activity.
    this.activityDropdown = page.locator(".oxd-select-text-input").first();

    // Se localizan únicamente los inputs correspondientes a las horas
    // dentro de la tabla de edición de la Timesheet.
    this.hourInputs = page.locator(
      ".orangehrm-timesheet-table-body input.oxd-input",
    );

    this.saveButton = page.getByRole("button", {
      name: "Save",
    });

    // Mensaje de validación asociado a valores de horas no permitidos.
    this.hoursValidationMessage = page.getByText(
      "Should Be Less Than 24 and in HH:MM or Decimal Format",
      { exact: true },
    );
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
  // ACCIONES SOBRE LA TIMESHEET
  // ===========================================================================

  /**
   * Busca y selecciona un proyecto disponible en el autocomplete.
   */
  async selectProject(projectName: string): Promise<void> {
    // Consultamos el valor actual del campo Project.
    const currentProject = await this.projectInput.inputValue();

    // Si el proyecto requerido ya está seleccionado,
    // evitamos realizar nuevamente la búsqueda.
    if (currentProject.includes(projectName)) {
      return;
    }

    // Activamos el campo Project.
    await this.projectInput.click();

    // Escribimos el proyecto para iniciar la búsqueda.
    await this.projectInput.fill(projectName);

    // Localizamos una opción del autocomplete que contenga
    // el nombre del proyecto solicitado.
    const projectOption = this.page
      .locator(".oxd-autocomplete-option")
      .filter({ hasText: projectName })
      .first();

    // OrangeHRM puede tardar algunos segundos en cargar
    // los resultados disponibles.
    await projectOption.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Seleccionamos el proyecto encontrado.
    await projectOption.click();
  }

  /**
   * Selecciona una actividad asociada al proyecto.
   */
  async selectActivity(activityName: string): Promise<void> {
    // Consultamos la actividad actualmente seleccionada.
    const currentActivity = (await this.activityDropdown.textContent()) ?? "";

    // Si la actividad requerida ya está seleccionada,
    // no es necesario abrir nuevamente el desplegable.
    if (currentActivity.includes(activityName)) {
      return;
    }

    // Abrimos el listado de actividades.
    await this.activityDropdown.click();

    // Seleccionamos la actividad solicitada.
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
   * Ingresa un valor de horas en el día indicado.
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

  /**
   * Intenta guardar los datos registrados en la hoja de tiempo.
   */
  async saveTimesheet(): Promise<void> {
    await this.saveButton.click();
  }

  // ===========================================================================
  // ELEMENTOS PARA VALIDACIÓN
  // ===========================================================================

  /**
   * Retorna el campo de horas correspondiente al día solicitado.
   */
  getHoursInput(dayIndex: number): Locator {
    return this.hourInputs.nth(dayIndex);
  }

  /**
   * Retorna el mensaje de validación asociado al campo de horas.
   */
  getHoursValidationMessage(): Locator {
    return this.hoursValidationMessage;
  }
}
