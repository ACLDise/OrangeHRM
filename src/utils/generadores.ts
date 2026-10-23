/**
 * Generadores de datos de prueba adicionales (capa: utils).
 *
 * - generarPdf: crea un PDF válido de un tamaño EXACTO en bytes (para probar el
 *   límite de 1.0 MB de la especificación sin depender de archivos guardados).
 * - aplicarVariacion: cambia mayúsculas/minúsculas de un texto (CP-ADM-006).
 */
import * as fs from 'fs';
import * as path from 'path';

/** Un KB = 1024 bytes (el límite "1.0 MB" de la aplicación = 1 048 576 bytes). */
export const KB = 1024;

const OBJETOS = [
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\n',
];

/** Ensambla el PDF con un relleno (líneas de comentario "%...") antes de los objetos. */
function armarPdf(relleno: string): Buffer {
  let cuerpo = `%PDF-1.4\n${relleno}`;
  const offsets: number[] = [];
  for (const o of OBJETOS) {
    offsets.push(Buffer.byteLength(cuerpo, 'latin1'));
    cuerpo += o;
  }
  const inicioXref = Buffer.byteLength(cuerpo, 'latin1');
  let xref = `xref\n0 ${OBJETOS.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${OBJETOS.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;
  return Buffer.from(cuerpo + xref + trailer, 'latin1');
}

/** Relleno de exactamente `bytes` bytes en líneas de comentario PDF de hasta 100 bytes. */
function rellenoDe(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes === 1) throw new Error('No se puede rellenar exactamente 1 byte.');
  let falta = bytes;
  let relleno = '';
  while (falta > 0) {
    let n = Math.min(falta, 100);
    if (falta - n === 1) n -= 1; // evita un resto de 1 byte (la línea mínima mide 2)
    relleno += `%${'x'.repeat(n - 2)}\n`;
    falta -= n;
  }
  return relleno;
}

/**
 * Crea un PDF válido de EXACTAMENTE `tamanoBytes` bytes y devuelve su ruta absoluta.
 * @throws Error si el tamaño pedido es menor que el PDF mínimo.
 */
export function generarPdf(rutaArchivo: string, tamanoBytes: number): string {
  const base = armarPdf('').length;
  if (tamanoBytes < base) {
    throw new Error(`El tamaño pedido (${tamanoBytes} bytes) es menor que un PDF mínimo (${base} bytes).`);
  }
  // El número de "startxref" cambia de cantidad de dígitos, por eso se ajusta iterando.
  let relleno = tamanoBytes - base;
  for (let i = 0; i < 6; i++) {
    const buf = armarPdf(rellenoDe(relleno));
    if (buf.length === tamanoBytes) {
      const absoluta = path.resolve(rutaArchivo);
      fs.mkdirSync(path.dirname(absoluta), { recursive: true });
      fs.writeFileSync(absoluta, buf);
      return absoluta;
    }
    relleno += tamanoBytes - buf.length;
  }
  throw new Error(`No se logró generar un PDF de ${tamanoBytes} bytes.`);
}

/** Quita acentos y pasa a mayúsculas para comparar nombres de variación. */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
}

/**
 * Aplica una variación de mayúsculas/minúsculas.
 * Valores aceptados (columna Variacion del Excel): MAYUSCULAS, MINUSCULAS, ALTERNADA.
 */
export function aplicarVariacion(texto: string, variacion: string): string {
  switch (normalizar(variacion)) {
    case 'MAYUSCULAS':
      return texto.toUpperCase();
    case 'MINUSCULAS':
      return texto.toLowerCase();
    case 'ALTERNADA':
      return [...texto].map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');
    default:
      throw new Error(`Variación "${variacion}" no válida. Use MAYUSCULAS, MINUSCULAS o ALTERNADA.`);
  }
}
