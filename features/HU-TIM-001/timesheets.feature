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

#Paso 1: Crear el Feature

Feature: Registro y envío de hojas de tiempo semanales

  Como empleado autenticado en la plataforma
  Quiero registrar y gestionar las horas trabajadas en mi hoja de tiempo semanal
  Para mantener un control del tiempo laborado antes de su aprobación

#Paso 2: Adición de etiquetas
@ui @time @regresion @CP-TIM-001

#Paso 3: Relación del Escenario
Scenario: Rechazar el registro de horas negativas

#Paso 4: Definir el Given
    Given que el empleado está autenticado con rol ESS
    And tiene una hoja de tiempo semanal en estado Not Submitted
    And existen un proyecto y una actividad válidos disponibles

#Paso 5: Definir el When
    When el empleado intenta enviar una hoja de tiempo que contiene -5 horas en una actividad válida

#Paso 6: Definir el Then
    Then el sistema debe rechazar el registro de horas negativas
    And el valor inválido no debe quedar registrado
    And la hoja de tiempo debe permanecer en estado Not Submitted

#_____________________________________________________________________________
#          CP-TIM-002 - Valores válidos para horas trabajadas
#_____________________________________________________________________________

#Paso 1: Crear el Feature
#No aplica

#Paso 2: Adición de etiquetas
@ui @time @regresion @CP-TIM-002

#Paso 3: Relación del Escenario
Scenario Outline: Guardar valores válidos de horas sin enviar la hoja de tiempo

#Paso 4: Definir el Given
    Given que el empleado está autenticado con rol ESS
    And tiene una hoja de tiempo semanal en estado Not Submitted
    And existen un proyecto y una actividad válidos disponibles

#Paso 5: Definir el When
     When el empleado registra <hours> horas en una actividad válida
     And guarda la hoja de tiempo sin enviarla

#Paso 6: Definir el Then
    Then el sistema debe aceptar el valor de <hours> horas
    And el valor debe quedar guardado sin errores
    And la hoja de tiempo debe permanecer en estado Draft

#Paso 7: Definir los ejemplos
    Examples:
      | hours |
      | 0     |
      | 1     |
      | 8     |
      | 24    |