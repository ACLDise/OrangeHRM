# language: es
@CP-ADM-008 @puestos
Característica: Eliminación de un puesto sin dependencias
  Como administrador del sistema
  Quiero eliminar puestos que no tienen empleados
  Para mantener el catálogo depurado

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un puesto sin empleados se elimina correctamente

    Esquema del escenario: Administrador elimina un puesto sin empleados asignados
      Dado que existe un puesto registrado con título de <LongTitulo> caracteres
      Cuando el administrador elimina el puesto
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto ya no aparece en el catálogo de puestos

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | MensajeEsperado      |
        | CP-ADM-008-01 | 30         | Successfully Deleted |
