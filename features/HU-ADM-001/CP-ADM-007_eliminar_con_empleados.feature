# language: es
@CP-ADM-007 @puestos
Característica: Eliminación de un puesto con empleados asignados
  Como administrador del sistema
  Quiero que no se pueda eliminar un puesto que tiene empleados
  Para no dejar empleados sin puesto

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un puesto con empleados activos no se puede eliminar

    Esquema del escenario: Administrador intenta eliminar un puesto con un empleado asignado
      Dado que existe un puesto registrado con título de <LongTitulo> caracteres
      Y que el puesto tiene un empleado asignado
      Cuando intenta eliminar el puesto
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto sigue en el catálogo de puestos

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | MensajeEsperado    |
        | CP-ADM-007-01 | 30         | Cannot be deleted  |
