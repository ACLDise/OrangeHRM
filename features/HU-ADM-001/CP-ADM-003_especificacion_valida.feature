# language: es
@CP-ADM-003 @puestos
Característica: Carga de la especificación del puesto (archivo válido)
  Como administrador del sistema
  Quiero adjuntar una especificación en PDF al puesto
  Para documentar las funciones del cargo (máximo 1.0 MB)

  Antecedentes:
    Dado que el administrador ha iniciado sesión

  Regla: Un PDF dentro del límite de tamaño se carga y el puesto se guarda

    Esquema del escenario: Administrador registra un puesto con una especificación PDF dentro del límite
      Dado que el administrador está en el catálogo de puestos
      Cuando registra un puesto con una especificación PDF de <TamanoKB> KB
      Entonces el sistema confirma que el puesto fue guardado
      Y el puesto aparece en el catálogo de puestos

      @excel
      Ejemplos:
        | IdFila        | TamanoKB |
        | CP-ADM-003-01 | 500      |
        | CP-ADM-003-02 | 1000     |
