/**
 * Registro cerrado de casos automatizados (capa: registro).
 *
 * Relaciona TestCaseId ↔ feature fuente ↔ hoja del Excel (la hoja se llama igual
 * que el TestCaseId). Agregar un caso = agregar una línea aquí + su feature,
 * su hoja y sus steps; no se modifican el controlador ni los hooks (OCP).
 */
export interface CasoRegistrado {
  /** TestCaseId, igual al tag del feature y al nombre de la hoja de Excel. */
  id: string;
  /** Ruta del feature fuente (documentación viva). */
  feature: string;
}

export const CASOS: CasoRegistrado[] = [
  { id: 'CP-ADM-001', feature: 'features/puestos/CP-ADM-001_registro_puesto.feature' },
  { id: 'CP-ADM-002', feature: 'features/puestos/CP-ADM-002_limite_titulo.feature' },
  { id: 'CP-ADM-003', feature: 'features/puestos/CP-ADM-003_especificacion_valida.feature' },
  { id: 'CP-ADM-004', feature: 'features/puestos/CP-ADM-004_especificacion_excede.feature' },
  { id: 'CP-ADM-005', feature: 'features/puestos/CP-ADM-005_puesto_duplicado.feature' },
  { id: 'CP-ADM-006', feature: 'features/puestos/CP-ADM-006_unicidad_mayusculas.feature' },
  { id: 'CP-ADM-007', feature: 'features/puestos/CP-ADM-007_eliminar_con_empleados.feature' },
  { id: 'CP-ADM-008', feature: 'features/puestos/CP-ADM-008_eliminar_sin_empleados.feature' },
];
