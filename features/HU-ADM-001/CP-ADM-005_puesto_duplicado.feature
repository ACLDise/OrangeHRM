# language: es
@CP-ADM-005 @puestos
Característica: Unicidad del título de puesto
  Como administrador del sistema
  Quiero que no se permitan puestos con el mismo título
  Para mantener un catálogo sin duplicados

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un título ya existente muestra "Already exists" y no se guarda

    Esquema del escenario: Administrador intenta registrar un puesto duplicado
      Dado que existe un puesto registrado con título de <LongTitulo> caracteres
      Cuando intenta registrar otro puesto con el mismo título
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto no se guarda
      Y solo existe un puesto con ese título en el catálogo

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | MensajeEsperado |
        | CP-ADM-005-01 | 30         | Already exists  |
