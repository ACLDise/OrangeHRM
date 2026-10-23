/**
 * list-cases (capa: scripts) — imprime los TestCaseId disponibles (lo usa el .bat).
 */
import { CASOS } from '../src/registry/casos';

for (const c of CASOS) console.log(`  ${c.id}`);
