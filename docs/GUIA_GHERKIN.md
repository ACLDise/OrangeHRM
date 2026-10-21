# Guía Gherkin del proyecto

Idioma: español, `# language: es` en la primera línea. Tercera persona, tiempos verbales uniformes.

**Reglas**
1. Declarativo: QUÉ y QUÉ resultado; nunca clics, campos, selectores, URLs ni esperas.
2. Un comportamiento por escenario; 3 a 7 pasos.
3. `Dado` = contexto, `Cuando` = una acción de negocio, `Entonces` = resultado observable (sin acciones).
4. Escenarios independientes: las precondiciones van en su propio `Dado`.
5. `Antecedentes` solo para contexto común a todos los escenarios (aquí: inicio de sesión).
6. `Esquema del escenario` + `@excel Ejemplos:` cuando varían los datos. Columnas solo de negocio y no sensibles.
7. Una frase = un step definition; sin sinónimos para el mismo paso.

**Tags**
| Tag | Uso |
|---|---|
| `@CP-ADM-001` | TestCaseId (obligatorio) |
| `@puestos` | Módulo funcional |
| `@excel` | Bloque de ejemplos alimentado desde el Excel |
| `@fila:<IdFila>` | Generado automáticamente por fila |
| `@wip` | En desarrollo; excluido de las corridas |

**Glosario:** Administrador (rol Admin) · Puesto (Job Title) · Descripción del puesto (Job Description, ≤ 400) · Nota (Note, ≤ 400) · Especificación del puesto (archivo adjunto ≤ 1 MB).
