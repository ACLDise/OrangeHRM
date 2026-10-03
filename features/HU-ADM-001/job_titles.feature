# ============================================================================
# 📁 job_titles.feature — Escenarios BDD para Títulos de Puesto (HU-ADM-001)
# ============================================================================
#
# ¿QUÉ ES ESTE ARCHIVO?
# Este es un archivo de características (Feature File) escrito en Gherkin.
# Define los criterios de aceptación para la gestión de puestos de trabajo
# en OrangeHRM siguiendo las buenas prácticas de BDD y ISTQB.
#
# PALABRAS CLAVE DE GHERKIN:
#   Característica:   → Área del sistema que estamos probando (HU-ADM-001)
#   Contexto:         → Pasos que se ejecutan antes de cada escenario
#   Escenario:        → Un caso de prueba específico
#   Esquema del escenario: → Plantilla para múltiples casos con diferentes datos
#   Dado:             → Condición inicial / precondición
#   Cuando:           → Acción que realiza el usuario
#   Entonces:         → Resultado esperado / verificación del sistema
#   Ejemplos:         → Tabla de datos para los Esquemas del escenario
#
# ETIQUETAS (@):
#   @ui               → Prueba automatizada de interfaz en navegador (Playwright)
#   @admin            → Requiere permisos del rol Administrador
#   @humilde/@smoke   → Pruebas críticas del flujo principal
#   @regresion        → Pruebas de cobertura completa (validaciones y errores)
# ============================================================================

@ui @admin
Feature: Configuración de Títulos de Puesto (HU-ADM-001)
  Como Administrador autenticado en la plataforma.
  Quiero Registrar, editar y eliminar los títulos de puesto (Job Titles) adjuntando la especificación del cargo.
  Para Mantener un catálogo oficial de cargos dentro del sistema y asignarlo a los registros de personal.

  # ── Contexto ────────────────────────────────────────────────────────────
  # Precondición compartida: El usuario ya inició sesión como Admin 
  # y se encuentra ubicado en la sección de Puestos de Trabajo.
  Background:
    Given el usuario Administrador se encuentra en la página de "Job Titles"

  # ── CA-01-001: Validación de Longitud en Campos de Texto ──────────────────
  # Valida el registro exitoso y las restricciones de longitud máxima en
  # los campos Título, Descripción y Nota del puesto.
  @smoke @regresion
  Scenario Outline: Validar el registro de puestos con diferentes entradas de texto
    When el usuario registra un nuevo puesto con título "<titulo_puesto>", descripción "<descripcion_puesto>" y nota "<nota_puesto>"
    Then el sistema debe generar el resultado "<resultado_esperado>"
    And mostrar el mensaje "<mensaje_esperado>"

    Examples:
      | escenario_id | titulo_puesto                          | descripcion_puesto              | nota_puesto                      | resultado_esperado | mensaje_esperado                 |
      | CP-ADM-1     | Product Manager                        | Descripción válida de producto  | Nota sobre reuniones y equipo    | Guardar Registro   | Successfully Saved               |
      | CP-ADM-2     | Texto de mas de 100 caracteres (A...A) | Descripción válida              | Nota válida                      | Bloquear Envío     | Should not exceed 100 characters |

  # ── CA-01-002: Restricciones de Archivos Adjuntos ─────────────────────────
  # Verifica las reglas para subir la especificación del cargo (PDF válido
  # y límite de tamaño máximo permitido > 1.0 MB).
  @regresion
  Scenario Outline: Validar restricciones de carga de archivos de especificación
    When el usuario crea el puesto "<titulo_puesto>" adjuntando el archivo "<nombre_archivo>" de tamaño "<tamanio_archivo>"
    Then el sistema debe generar el resultado "<resultado_esperado>"
    And mostrar el mensaje "<mensaje_esperado>"

    Examples:
      | escenario_id | titulo_puesto     | nombre_archivo  | tamanio_archivo | resultado_esperado | mensaje_esperado         |
      | CP-ADM-3     | DevOps Engineer   | spec_devops.pdf | 800 KB          | Guardar Registro   | Successfully Saved       |
      | CP-ADM-4     | Backend Developer | job_desc.docx   | 1.2 MB          | Bloquear Carga     | Attachment Size Exceeded |

  # ── CA-01-003: Control de Duplicidad ─────────────────────────────────────
  # Valida el comportamiento del sistema al intentar registrar títulos
  # existentes y evalúa las reglas de sensibilidad a mayúsculas/minúsculas.
  @regresion
  Scenario Outline: Validar reglas de prevención de títulos duplicados
    Given el puesto de trabajo "<puesto_existente>" ya se encuentra registrado en el sistema
    When el usuario intenta registrar un título de puesto con el nombre "<titulo_ingresado>"
    Then el sistema debe evaluar la sensibilidad a mayúsculas "<sensibilidad>"
    And generar el resultado "<resultado_esperado>"
    And mostrar el mensaje "<mensaje_esperado>"

    Examples:
      | escenario_id | puesto_existente  | titulo_ingresado  | sensibilidad    | resultado_esperado | mensaje_esperado |
      | CP-ADM-5     | Quality Assurance | Quality Assurance | Coincidencia Exacta | Bloquear Envío     | Already Exists   |
      | CP-ADM-6a    | Quality Assurance | quality assurance | Sensible        | Guardar Registro   | Successfully Saved |
      | CP-ADM-6b    | Quality Assurance | quality assurance | No Sensible     | Bloquear Envío     | Already Exists   |

  # ── CA-01-004: Restricciones de Eliminación por Dependencias ─────────────
  # Comprueba que los puestos asignados a empleados activos no se puedan
  # eliminar, mientras que los desasignados se borran correctamente.
  @smoke @regresion
  Scenario Outline: Validar restricciones de eliminación según asignación de personal
    Given el puesto de trabajo "<puesto_objetivo>" tiene un estado de asignación de empleados activos como "<tiene_empleados_activos>"
    When el usuario intenta eliminar el puesto de trabajo "<puesto_objetivo>"
    Then el sistema debe generar el resultado "<resultado_esperado>"
    And mostrar el mensaje "<mensaje_esperado>"

    Examples:
      | escenario_id | puesto_objetivo   | tiene_empleados_activos | resultado_esperado | mensaje_esperado                                     |
      | CP-ADM-7     | Software Engineer | verdadero               | Cancelar Borrado   | Cannot be deleted because it is assigned to employees |
      | CP-ADM-8     | Junior Designer   | falso                   | Eliminar Registro  | Successfully Deleted                                 |