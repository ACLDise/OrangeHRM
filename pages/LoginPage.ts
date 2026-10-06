// Importamos el tipo Page desde Playwright.
// Page representa la pestaña o página del navegador que será controlada.
import { Page, Locator } from "@playwright/test";

// Clase Page Object para la pantalla de inicio de sesión de OrangeHRM.
export class LoginPage {
  // Declaración de los locators que pertenecen a esta página.
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  // El constructor recibe la página creada por Playwright.
  // La guardamos para poder usarla después dentro de los métodos de esta clase.
  constructor(private readonly page: Page) {
    // Campo donde se escribe el nombre de usuario.
    this.usernameInput = page.getByPlaceholder("Username");

    // Campo donde se escribe la contraseña.
    this.passwordInput = page.getByPlaceholder("Password");

    // Botón utilizado para iniciar sesión.
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async login(username: string, password: string): Promise<void> {
    // Escribe el nombre de usuario en el campo Username.
    await this.usernameInput.fill(username);

    // Escribe la contraseña en el campo Password.
    await this.passwordInput.fill(password);

    // Hace clic en el botón Login.
    await this.loginButton.click();
  }
}
