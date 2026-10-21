# language: es
@CP-ADM-001 @puestos
Característica: Registro de puestos de trabajo
  Como administrador del sistema
  Quiero registrar puestos de trabajo
  Para mantener un catálogo oficial de cargos

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un puesto con datos dentro de los límites se registra correctamente

    Esquema del escenario: Administrador registra un puesto con datos válidos
      Dado que el administrador está en el catálogo de puestos
      Cuando registra un puesto con título de <LongTitulo> caracteres, descripción de <LongDescripcion> caracteres y nota de <LongNota> caracteres
      Entonces el sistema confirma que el puesto fue guardado
      Y el puesto aparece en el catálogo de puestos

      @excel
      Ejemplos:
        | IdFila        | LongTitulo | LongDescripcion | LongNota |
        | CP-ADM-001-01 | 100        | 400             | 400      |
        | CP-ADM-001-02 | 1          | 400             | 400      |
