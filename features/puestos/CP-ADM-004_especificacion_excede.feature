# language: es
@CP-ADM-004 @puestos
Característica: Carga de la especificación del puesto (archivo demasiado grande)
  Como administrador del sistema
  Quiero que el sistema rechace especificaciones que superen el tamaño máximo
  Para proteger el almacenamiento y cumplir la regla de 1.0 MB

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un archivo mayor a 1.0 MB muestra un error y no se guarda el puesto

    Esquema del escenario: Administrador intenta adjuntar una especificación que excede el tamaño máximo
      Dado que el administrador está en el catálogo de puestos
      Cuando intenta registrar un puesto con una especificación PDF de <TamanoKB> KB
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto no se guarda

      @excel
      Ejemplos:
        | IdFila        | TamanoKB | MensajeEsperado          |
        | CP-ADM-004-01 | 1100     | Attachment Size Exceeded |
        | CP-ADM-004-02 | 2048     | Attachment Size Exceeded |
