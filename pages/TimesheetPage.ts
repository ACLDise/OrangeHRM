import { Page, Locator } from "@playwright/test";

/**
 * Page Object del módulo Time / Timesheets.
 * Centraliza los elementos y acciones reutilizables sobre una hoja de tiempo.
 */
export class TimesheetPage {
  // ===========================================================================
  // CONFIGURACIÓN INTERNA
  // ===========================================================================

  // Los campos de horas comienzan en el tercer textbox de la pantalla:
  // 0 = buscador lateral, 1 = proyecto, 2 = primer día de la Timesheet.
  private readonly HOURS_INPUT_OFFSET = 2;

  // ===========================================================================
  // LOCATORS DE NAVEGACIÓN
  // ===========================================================================

  // Opción Time del menú lateral principal.
  private readonly timeMenu: Locator;

  // Menú desplegable Timesheets.
  private readonly timesheetsMenu: Locator;

  // Opción My Timesheets.
  private readonly myTimesheetsOption: Locator;

  // Botón para acceder a la edición de la hoja de tiempo.
  private readonly editButton: Locator;

  // ===========================================================================
  // LOCATORS DE LA TIMESHEET
  // ===========================================================================

  // Campo autocomplete utilizado para seleccionar el proyecto.
  private readonly projectInput: Locator;

  // Desplegable utilizado para seleccionar la actividad.
  private readonly activityDropdown: Locator;

  // Conjunto de campos de texto disponibles en la pantalla.
  private readonly hourInputs: Locator;

  // Botón para guardar los cambios realizados.
  private readonly saveButton: Locator;

  // Mensaje mostrado cuando el valor ingresado en horas no es válido.
  private readonly hoursValidationMessage: Locator;

  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================

  constructor(private readonly page: Page) {
    // Navegación del módulo Time.
    this.timeMenu = page.getByRole("link", { name: "Time" });

    this.timesheetsMenu = page
      .locator(".oxd-topbar-body-nav-tab-item")
      .filter({ hasText: "Timesheets" });

    this.myTimesheetsOption = page.getByRole("menuitem", {
      name: "My Timesheets",
    });

    this.editButton = page.getByRole("button", {
      name: "Edit",
    });

    // Elementos de edición de la hoja de tiempo.
    this.projectInput = page.getByPlaceholder("Type for hints...");

    this.activityDropdown = page
      .locator(".oxd-select-text-input")
      .filter({ hasText: "-- Select --" });

    this.hourInputs = page.getByRole("textbox");

    this.saveButton = page.getByRole("button", {
      name: "Save",
    });

    // Mensaje asociado a la validación del campo de horas.
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
    await this.projectInput.fill(projectName);

    await this.page.getByText(projectName, { exact: false }).click();
  }

  /**
   * Selecciona una actividad asociada al proyecto.
   */
  async selectActivity(activityName: string): Promise<void> {
    await this.activityDropdown.click();

    await this.page.getByText(activityName, { exact: true }).click();
  }

  /**
   * Ingresa un valor de horas en el día indicado.
   * dayIndex: 0 = lunes, 1 = martes, ... , 6 = domingo.
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
    return this.hourInputs.nth(dayIndex + this.HOURS_INPUT_OFFSET);
  }

  /**
   * Retorna el mensaje de validación asociado al campo de horas.
   */
  getHoursValidationMessage(): Locator {
    return this.hoursValidationMessage;
  }
}
