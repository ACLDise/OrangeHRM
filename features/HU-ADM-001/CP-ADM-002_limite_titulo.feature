# language: es
@CP-ADM-002 @puestos
Característica: Límite de caracteres del Job Title
  Como administrador del sistema
  Quiero que el sistema controle la longitud del título del puesto
  Para evitar datos fuera del límite permitido (100 caracteres)

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un título de más de 100 caracteres no se puede guardar

    Esquema del escenario: Administrador intenta registrar un título que supera el límite
      Dado que el administrador está en el catálogo de puestos
      Cuando intenta registrar un puesto con título de <LongTitulo> caracteres
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto no se guarda

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | MensajeEsperado                  |
        | CP-ADM-002-01 | 101        | Should not exceed 100 characters |
        | CP-ADM-002-02 | 150        | Should not exceed 100 characters |
