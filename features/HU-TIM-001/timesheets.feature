#-----------------------------------------------------------------------------
#      HU-TIM-001 - Registro y Envío de Hojas de Tiempo Semanales
#                            Módulo: Time
#-----------------------------------------------------------------------------
# Casos de prueba automatizados asociados:
# CP-TIM-001; CP-TIM-002; CP-TIM-003; CP-TIM-006; CP-TIM-007; CP-TIM-008
#-----------------------------------------------------------------------------

#_____________________________________________________________________________
#          CP-TIM-001 - Rechazar el registro de horas negativas
#_____________________________________________________________________________

Feature: Registro y envío de hojas de tiempo semanales

  Como empleado autenticado en la plataforma
  Quiero registrar y gestionar las horas trabajadas en mi hoja de tiempo semanal
  Para mantener un control del tiempo laborado antes de su aprobación

  @ui @time @regresion @CP-TIM-001
  Scenario: Rechazar el registro de horas negativas
    Given que el usuario está autenticado en OrangeHRM
    And tiene acceso a la edición de su hoja de tiempo
    And existen un proyecto y una actividad válidos disponibles
    When intenta guardar -5 horas asociadas a un proyecto y actividad válidos
    Then el sistema debe rechazar el valor negativo
    And debe mostrar un mensaje de validación en el campo de horas
    And debe permanecer en la pantalla de edición de la hoja de tiempo

#_____________________________________________________________________________
#          CP-TIM-002 - Valores válidos para horas trabajadas
#_____________________________________________________________________________

@ui @time @regresion @CP-TIM-002
  Scenario Outline: Registrar valores válidos de horas en la hoja de tiempo

    Given que el usuario está autenticado en OrangeHRM
    And tiene acceso a la edición de su hoja de tiempo
    And existen un proyecto y una actividad válidos disponibles

    When registra <horas> horas asociadas a un proyecto y actividad válidos
    And guarda la hoja de tiempo

    Then el sistema debe aceptar el valor registrado
    And no debe mostrar mensajes de validación en el campo de horas

    Examples:
      | horas |
      | 0     |
      | 8     |
      | 23    |

#_____________________________________________________________________________
#  CP-TIM-003 - Rechazar el registro de horas superiores al límite permitido
#_____________________________________________________________________________

  @ui @time @regresion @CP-TIM-003
  Scenario: Rechazar el registro de horas superiores al límite permitido

    Given que el usuario está autenticado en OrangeHRM
    And tiene acceso a la edición de su hoja de tiempo
    And existen un proyecto y una actividad válidos disponibles

    When intenta guardar 25 horas asociadas a un proyecto y actividad válidos

    Then el sistema debe rechazar el valor ingresado
    And debe mostrar un mensaje de validación en el campo de horas
    And debe permanecer en la pantalla de edición de la hoja de tiempo

#_____________________________________________________________________________
#       CP-TIM-006 - Validar obligatoriedad de Proyecto y Actividad
#_____________________________________________________________________________

  @ui @time @regresion @CP-TIM-006
  Scenario: Rechazar el registro de horas sin proyecto ni actividad

    Given que el usuario está autenticado en OrangeHRM
    And tiene acceso a la edición de su hoja de tiempo

    When registra 8 horas sin seleccionar proyecto ni actividad
    And intenta guardar la hoja de tiempo

    Then el sistema debe impedir el guardado
    And debe indicar que el proyecto es obligatorio
    And debe permanecer en la pantalla de edición de la hoja de tiempo


  @ui @time @regresion @CP-TIM-006
  Scenario: Rechazar el registro de horas con proyecto y sin actividad

    Given que el usuario está autenticado en OrangeHRM
    And tiene acceso a la edición de su hoja de tiempo
    And existe un proyecto válido disponible

    When selecciona un proyecto válido
    And registra 8 horas sin seleccionar una actividad
    And intenta guardar la hoja de tiempo

    Then el sistema debe impedir el guardado
    And debe indicar que la actividad es obligatoria
    And debe permanecer en la pantalla de edición de la hoja de tiempo