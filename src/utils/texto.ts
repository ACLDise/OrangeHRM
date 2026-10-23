/**
 * Utilidades de generación de datos de prueba (capa: utils).
 *
 * Los textos se generan por código con la LONGITUD EXACTA pedida, para no depender
 * de textos pegados a mano (que pueden tener espacios de más) y para que cada
 * ejecución use un nombre único dentro del límite de caracteres.
 */

const RELLENO = 'Lorem ipsum dolor sit amet consectetur adipiscing elit ';

/** Token corto y único por ejecución (base36 de la hora + azar). */
export function tokenUnico(): string {
  const azar = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${Date.now().toString(36).toUpperCase()}${azar}`;
}

/**
 * Devuelve un texto de exactamente `longitud` caracteres.
 * Comienza con `prefijo` (truncado si excede) y se completa con texto de relleno.
 * El último carácter nunca es un espacio, porque la aplicación podría recortarlo
 * y la longitud efectiva dejaría de ser la esperada.
 */
export function textoDeLongitud(longitud: number, prefijo = ''): string {
  if (!Number.isInteger(longitud) || longitud < 0) {
    throw new Error(`La longitud "${longitud}" no es un entero válido (>= 0).`);
  }
  if (longitud === 0) return '';
  let base = prefijo.slice(0, longitud);
  while (base.length < longitud) {
    base += RELLENO.slice(0, longitud - base.length);
  }
  base = base.slice(0, longitud);
  return base.endsWith(' ') ? `${base.slice(0, -1)}x` : base;
}

/**
 * Título de puesto único de `longitud` caracteres.
 * El token único va AL INICIO para que el límite de longitud nunca lo recorte.
 * Para longitud 1 no cabe un token: se usa una letra al azar (su unicidad se
 * valida porque el sistema bloquea duplicados con "Already exists").
 */
export function tituloUnico(longitud: number): string {
  if (longitud <= 1) {
    const letras = 'abcdefghijklmnopqrstuvwxyz';
    return textoDeLongitud(longitud, letras[Math.floor(Math.random() * letras.length)]);
  }
  return textoDeLongitud(longitud, `QA${tokenUnico()} `);
}

/** Reemplaza el secreto en un texto, para no filtrar contraseñas a reportes/logs. */
export function ocultarSecreto(texto: string, secreto: string | undefined): string {
  if (!secreto) return texto;
  return texto.split(secreto).join('***');
}
