# language: es
@CP-ADM-006 @puestos
Característica: Unicidad del título sin distinguir mayúsculas/minúsculas
  Como administrador del sistema
  Quiero que "Analista" y "ANALISTA" se traten como el mismo puesto
  Para evitar duplicados por variaciones de escritura

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Una variación de mayúsculas/minúsculas se considera duplicado

    Esquema del escenario: Administrador intenta registrar el mismo título con otra variación de mayúsculas
      Dado que existe un puesto registrado con título de <LongTitulo> caracteres
      Cuando intenta registrar otro puesto con el mismo título en <Variacion>
      Entonces el sistema muestra el mensaje "<MensajeEsperado>"
      Y el puesto no se guarda
      Y no existe un puesto con el título en <Variacion>

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | Variacion   | MensajeEsperado |
        | CP-ADM-006-01 | 30         | MAYUSCULAS  | Already exists  |
        | CP-ADM-006-02 | 30         | MINUSCULAS  | Already exists  |
