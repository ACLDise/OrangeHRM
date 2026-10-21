# Arquitectura

```mermaid
flowchart TD
  X[data/input/datos_pruebas.xlsx] --> V[prepare-data: validación + filtros]
  V --> R[.run/rows.json + .run/run.json]
  V --> G[.run/features/ con @fila:IdFila]
  F[features/ fuente] --> V
  G --> C[Cucumber.js]
  C --> H[World + hooks: browser, context, trace, video]
  H --> S[Step definitions delgadas]
  S --> P[Screenplay: Actor → Tasks → Interactions / Questions]
  P --> M[POM: Pages con locators]
  M --> W[Playwright]
  H --> E[reports/fecha/evidencias/Caso/IdFila]
  C --> HT[cucumber-report.html / .json]
  E --> RX[report.ts → resultados.xlsx]
```

## Capas
| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Gherkin | `features/` | QUÉ, en lenguaje de negocio |
| Steps | `src/steps/` | Traducir frase → Screenplay; aserciones |
| Screenplay | `src/screenplay/` | CÓMO en términos de negocio (Actor, Tasks, Interactions, Questions) |
| POM | `src/pages/` | DÓNDE: solo locators |
| Infraestructura | `src/support/` | World, hooks, evidencias |
| Datos | `src/controller/`, `scripts/` | Excel → features por fila |
| Registro | `src/registry/casos.ts` | TestCaseId ↔ feature ↔ hoja |

## Decisiones
- **Browser perezoso:** se lanza en el primer `Before` (y no en `BeforeAll`) porque el perfil `headed` llega por `worldParameters`.
- **Sin esperas fijas:** auto-wait, `waitFor`, `waitForURL` y aserciones web-first. Los timeouts están en `src/config/config.ts`.
- **`retry: 0`:** no se reintentan acciones que cambian datos.
- **Textos generados:** las longitudes exactas se generan por código (no pegados a mano).
- **Nombre del script `prepare-data`:** `prepare` es un ciclo de vida de npm y se ejecutaría en cada `npm install`.
- **Agregar un caso (OCP):** feature + hoja Excel + steps/Tasks + una línea en el registro.
