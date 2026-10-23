# Certificación caso a caso

| TestCaseId | Feature | Modalidad | Fecha | Filas probadas | Resultado | Evidencia | Estado | Observaciones |
|---|---|---|---|---|---|---|---|---|
| CP-ADM-001 | `puestos/CP-ADM-001_registro_puesto.feature` | C (conocimiento de OrangeHRM; sin navegación asistida) | 2026-10-20 | 0 (pendiente ejecución en Windows) | — | — | En desarrollo | Dry-run OK (2 escenarios, 14 pasos, sin indefinidos ni ambiguos). Selectores en Supuesto. |
| CP-ADM-002 | — | — | — | — | — | — | Pendiente | Se aborda tras certificar CP-ADM-001 |
| CP-ADM-003 | — | — | — | — | — | — | Pendiente | |
| CP-ADM-004 | — | — | — | — | — | — | Pendiente | |
| CP-ADM-005 | — | — | — | — | — | — | Pendiente | |
| CP-ADM-006 | — | — | — | — | — | — | Pendiente | |
| CP-ADM-007 | — | — | — | — | — | — | Pendiente | |
| CP-ADM-008 | — | — | — | — | — | — | Pendiente | |

## Selectores de CP-ADM-001 (todos **Supuesto** hasta ejecutarse)
| Elemento | Selector | Motivo |
|---|---|---|
| Usuario / Clave (login) | `getByPlaceholder('Username' / 'Password')` | Placeholders del login de OrangeHRM |
| Botón Login | `getByRole('button', {name:'Login'})` | Rol + nombre |
| Encabezado Job Titles | `getByRole('heading', {name:'Job Titles'})` | Condición de pantalla lista |
| Botón Add | `getByRole('button', {name:'Add'})` | Rol + nombre |
| Job Title (campo) | `.oxd-input-group` filtrado por texto `Job Title` + `getByRole('textbox')` | **CSS justificado:** la etiqueta no está asociada al input |
| Job Description / Note | `getByPlaceholder('Type description here' / 'Add note')` | Placeholders |
| Botón Save | `getByRole('button', {name:'Save'})` | Rol + nombre |
| Confirmación | `getByText('Successfully Saved')` | Texto del toast |
| Fila del puesto | `getByRole('row')` con celda de texto exacto | Evita coincidencias parciales |
| Eliminar / Confirmar | primer botón de la fila / `getByRole('button', {name:/Yes, Delete/})` | Solo para limpieza |

## Observaciones fuera de alcance (no implementadas)
- Edición de Job Titles (la HU la menciona, sin caso).
- Job Title vacío (0 caracteres → «Required») y Description/Note de 401 caracteres: están en el borrador previo del usuario, pero no en los 8 casos oficiales.
