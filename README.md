# OrangeHRM – Suite de Pruebas Automatizadas

Proyecto de automatización de pruebas desarrollado sobre **OrangeHRM** como parte del **Diplomado en Aseguramiento de la Calidad de Software con Inteligencia Artificial** de la Pontificia Universidad Javeriana – Sede Cali.

La solución implementa pruebas funcionales automatizadas utilizando **Playwright con TypeScript**, el patrón de diseño **Page Object Model (POM)** y escenarios escritos en **Gherkin** mediante `playwright-bdd`.

---

## 1. Objetivo

Desarrollar una suite de pruebas automatizadas que permita validar funcionalidades relevantes de los módulos seleccionados de OrangeHRM.

La automatización busca cubrir, según el alcance de cada módulo:

- Inicio de sesión y autenticación.
- Validaciones funcionales.
- Operaciones CRUD.
- Reglas de negocio.
- Flujos principales.
- Estados del sistema.
- Escenarios de regresión.

---

## 2. Aplicación bajo prueba

**Aplicación:** OrangeHRM Open Source Demo

```text
https://opensource-demo.orangehrmlive.com/
```

El proyecto utiliza el ambiente público de demostración de OrangeHRM.

> **Nota:** al tratarse de un ambiente público y compartido, los datos, estados y tiempos de respuesta pueden variar entre ejecuciones.

---

## 3. Módulos incluidos

La suite contempla automatizaciones asociadas a diferentes módulos de OrangeHRM.

Actualmente la estructura del proyecto considera:

- **Time / Timesheets**
- **Admin**
- **Dashboard**

Cada módulo contiene sus propios casos de prueba, escenarios Gherkin y componentes de automatización de acuerdo con el alcance definido por el equipo.

---

## 4. Tecnologías utilizadas

| Tecnología         | Uso                                     |
| ------------------ | --------------------------------------- |
| Playwright         | Automatización de pruebas web           |
| TypeScript         | Lenguaje de programación                |
| Node.js            | Entorno de ejecución                    |
| npm                | Gestión de dependencias                 |
| playwright-bdd     | Integración de Playwright con Gherkin   |
| Gherkin            | Definición de escenarios BDD            |
| Page Object Model  | Organización y reutilización del código |
| Git                | Control de versiones                    |
| GitHub             | Repositorio remoto                      |
| Visual Studio Code | Entorno de desarrollo                   |

---

## 5. Arquitectura de automatización

La solución utiliza **Page Object Model (POM)** para separar las responsabilidades entre:

- Casos de prueba.
- Step Definitions.
- Localizadores.
- Navegación.
- Acciones sobre la interfaz.
- Validaciones reutilizables.

Se manejan dos rutas principales de ejecución.

### 5.1. Ejecución tradicional Playwright

```text
Caso de prueba .spec.ts
        ↓
Page Object
        ↓
OrangeHRM
        ↓
Validaciones Playwright
```

Los archivos `.spec.ts` implementan los casos de prueba automatizados reutilizando los Page Objects del proyecto.

### 5.2. Ejecución BDD

```text
Feature Gherkin
        ↓
Step Definitions
        ↓
Page Object
        ↓
OrangeHRM
        ↓
Validaciones Playwright
```

Los archivos `.feature` contienen los escenarios escritos en Gherkin y son relacionados con sus Step Definitions mediante `playwright-bdd`.

Los archivos `.feature` no llaman directamente a los archivos `.spec.ts`.

---

## 6. Estructura del proyecto

La estructura general del repositorio es:

```text
OrangeHRM/
│
├── .github/
│   └── workflows/
│
├── features/
│   ├── HU-ADM-001/
│   ├── HU-TIM-001/
│   ├── HU-DASH-002/
│   │
│   └── steps/
│
├── pages/
│   ├── LoginPage.ts
│   ├── TimesheetPage.ts
│   └── ...
│
├── tests/
│   ├── CP-TIM-XXX.spec.ts
│   ├── CP-ADM-XXX.spec.ts
│   ├── CP-DASH-XXX.spec.ts
│   └── ...
│
├── playwright-report/
├── test-results/
│
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md
```

La estructura puede ampliarse a medida que se incorporen nuevos casos y módulos.

---

## 7. Organización de los casos de prueba

Los casos de prueba se identifican mediante una nomenclatura asociada al módulo.

Ejemplos:

```text
CP-TIM-XXX
CP-ADM-XXX
CP-DASH-XXX
```

Los escenarios BDD utilizan igualmente estas identificaciones como etiquetas:

```gherkin
@CP-TIM-XXX
@CP-ADM-XXX
@CP-DASH-XXX
```

Esto permite mantener trazabilidad entre:

```text
Caso de prueba
      ↓
Escenario Gherkin
      ↓
Step Definitions
      ↓
Page Object
      ↓
Ejecución automatizada
      ↓
Resultado
```

---

## 8. Page Object Model

Los Page Objects se encuentran dentro de:

```text
pages/
```

Cada archivo centraliza la lógica asociada a una página o funcionalidad de OrangeHRM.

Ejemplos:

```text
LoginPage.ts
TimesheetPage.ts
DashboardPage.ts
AdminPage.ts
```

Dependiendo del módulo, un Page Object puede contener:

- Localizadores.
- Métodos de navegación.
- Acciones.
- Preparación de datos.
- Preparación de estados.
- Elementos utilizados para validación.

Este diseño evita duplicar localizadores y lógica dentro de los archivos `.spec.ts` y los Step Definitions.

---

## 9. Prerrequisitos

Antes de ejecutar el proyecto se requiere tener instalado:

- Git.
- Node.js.
- npm.
- Visual Studio Code o un editor compatible.

Para comprobar las versiones instaladas:

```bash
node --version
npm --version
git --version
```

---

## 10. Instalación

### 10.1. Clonar el repositorio

```bash
git clone https://github.com/ACLDise/OrangeHRM.git
```

Ingresar al proyecto:

```bash
cd OrangeHRM
```

### 10.2. Instalar dependencias

```bash
npm install
```

### 10.3. Instalar navegadores de Playwright

```bash
npx playwright install
```

---

## 11. Generación de pruebas BDD

Antes de ejecutar escenarios BDD se deben generar los tests correspondientes:

```bash
npx bddgen
```

Si existen Steps sin implementar, el comando mostrará:

```text
Missing step definitions
```

Estos Steps deben ser implementados antes de ejecutar los escenarios correspondientes.

---

## 12. Ejecución de pruebas

### Ejecutar todos los tests configurados

```bash
npx playwright test
```

### Ejecutar únicamente Chromium

```bash
npx playwright test --project=chromium
```

### Ejecutar mostrando el navegador

```bash
npx playwright test --project=chromium --headed
```

### Ejecutar un archivo específico

```bash
npx playwright test tests/CP-XXX-XXX.spec.ts --project=chromium --headed
```

---

## 13. Ejecución BDD

Para ejecutar los escenarios BDD:

```bash
npx playwright test --project=bdd
```

Para ejecutar un escenario específico mediante su etiqueta:

```bash
npx playwright test --project=bdd --grep "@CP-XXX-XXX" --headed
```

Ejemplo:

```bash
npx playwright test --project=bdd --grep "@CP-TIM-007" --headed
```

---

## 14. Ejecución secuencial

Algunos escenarios pueden modificar información persistente dentro del ambiente demo.

Cuando dos pruebas utilizan el mismo registro, empleado o dato, una ejecución paralela puede provocar interferencias.

Para estos casos puede utilizarse:

```bash
npx playwright test --workers=1
```

También es posible ejecutar individualmente el caso en un solo navegador:

```bash
npx playwright test tests/CP-XXX-XXX.spec.ts --project=chromium --headed
```

---

## 15. Reportes de ejecución

Playwright genera reportes HTML con los resultados de las pruebas.

Para visualizar el último reporte:

```bash
npx playwright show-report
```

Por defecto el reporte se publica localmente en:

```text
http://localhost:9323
```

Si el puerto ya se encuentra ocupado puede utilizarse otro:

```bash
npx playwright show-report --port 9324
```

Los reportes permiten consultar:

- Casos ejecutados.
- Casos Passed.
- Casos Failed.
- Duración.
- Steps ejecutados.
- Trazas.
- Errores.
- Evidencias configuradas.

---

## 16. Evidencias

Como parte de la entrega se conservan evidencias de las ejecuciones realizadas.

Estas pueden incluir:

- Reportes HTML.
- Capturas de pantalla.
- Resultados Passed / Failed.
- Evidencias de ejecución BDD.
- Evidencias de archivos `.spec.ts`.
- Videos o trazas cuando se encuentren habilitados.

Las evidencias consolidadas del proyecto se almacenan adicionalmente dentro de los artefactos definidos para la entrega académica.

---

## 17. Gherkin y BDD

Los escenarios funcionales son documentados utilizando Gherkin.

Ejemplo general:

```gherkin
@ui @modulo @regresion @CP-XXX-001
Scenario: Validar comportamiento esperado

  Given que se cumplen las precondiciones del usuario

  When ejecuta la acción correspondiente

  Then el sistema debe generar el resultado esperado
```

Los Steps correspondientes son implementados en:

```text
features/steps/
```

y reutilizan los Page Objects definidos dentro de:

```text
pages/
```

---

## 18. Manejo del ambiente demo

OrangeHRM Demo es un ambiente público, por lo cual pueden presentarse situaciones como:

- Datos modificados por terceros.
- Registros previamente existentes.
- Estados persistentes.
- Variabilidad en los tiempos de respuesta.
- Cambios de información entre ejecuciones.
- Interferencia durante ejecuciones concurrentes.

Por esta razón, los casos automatizados pueden incluir mecanismos para preparar los datos o estados necesarios antes de ejecutar el comportamiento que se desea validar.

---

## 19. Uso de Inteligencia Artificial

La inteligencia artificial se utiliza como herramienta de apoyo para actividades relacionadas con:

- Generación inicial de propuestas de automatización.
- Construcción y revisión de escenarios Gherkin.
- Análisis de errores.
- Propuestas de localizadores.
- Depuración.
- Documentación.
- Revisión de código.

Las propuestas generadas mediante IA son revisadas y verificadas mediante ejecución real antes de incorporarse como código definitivo.

El flujo utilizado es:

```text
Propuesta IA
      ↓
Revisión del equipo
      ↓
Implementación
      ↓
Ejecución
      ↓
Análisis de resultados
      ↓
Corrección
      ↓
Código final
```

El análisis detallado de los prompts utilizados, código generado y modificaciones realizadas se documenta dentro del informe correspondiente a la entrega.

---

## 20. Control de versiones

El proyecto utiliza Git y GitHub.

Se recomienda que cada integrante trabaje en una rama independiente.

Ejemplo:

```text
main
├── feature-time
├── feature-admin
└── feature-dashboard
```

Flujo recomendado:

```text
Crear rama
    ↓
Desarrollar automatización
    ↓
Ejecutar pruebas
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Integración a main
```

Antes de realizar un Pull Request se recomienda comprobar que los casos desarrollados ejecuten correctamente.

---

## 21. Integración continua

El repositorio incluye configuración dentro de:

```text
.github/workflows/
```

para permitir la integración del proyecto con GitHub Actions.

La configuración puede ampliarse de acuerdo con las necesidades de ejecución automática del equipo.

---

## 22. Pruebas de API

Las pruebas de API serán implementadas cuando los módulos incluidos dentro del alcance expongan endpoints adecuados para su automatización y estos formen parte del alcance definido para el proyecto.

La decisión y justificación correspondiente se documentará dentro de la estrategia de automatización.

---

## 23. Limitaciones

Las principales limitaciones identificadas corresponden al uso del ambiente público de OrangeHRM:

- Disponibilidad variable del servidor.
- Rendimiento variable.
- Datos compartidos con terceros.
- Persistencia de estados.
- Posibles condiciones de carrera.
- Cambios realizados por otros usuarios.

Estas condiciones deben considerarse al analizar los resultados de ejecución.

---

## 24. Estrategia de automatización

La selección de casos de prueba automatizados se realiza considerando criterios como:

- Criticidad funcional.
- Frecuencia de ejecución.
- Estabilidad.
- Reutilización.
- Facilidad de automatización.
- Valor para regresión.
- ROI de automatización.

El análisis detallado se encuentra documentado en el informe correspondiente a la **Entrega 4 – Suite de Pruebas Automatizadas**.

---

## 25. Repositorio

Repositorio principal del proyecto:

```text
https://github.com/ACLDise/OrangeHRM
```

---

## 26. Equipo

**Diplomado en Aseguramiento de la Calidad de Software con Inteligencia Artificial**

**Pontificia Universidad Javeriana – Sede Cali**

Integrantes:

- Lina María Ovalle Sánchez
- Jenifer Tatiana Zamudio Mendoza
- Kevin Stewarts Prieto Chaves

Bogotá D.C. – 2026
