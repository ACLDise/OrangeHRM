# Guía de ejecución (usuario final)

## 1. Requisitos
- Windows con **Node.js 20 o superior** (en la máquina de desarrollo se usa v22.22.0). Para verificar: abra `cmd` y escriba `node -v`.
- Conexión a internet (la primera instalación descarga dependencias y el navegador).

## 2. Instalación (una sola vez)
1. Descomprima la carpeta del proyecto.
2. Doble clic en `ejecutar_pruebas.bat` y elija la opción **10** (Instalar dependencias). Esto instala todo, crea el archivo `.env` y lo abre.
3. En `.env` complete `E2E_USER` y `E2E_PASSWORD` con las credenciales de prueba del Administrador. **Nunca** las escriba en el Excel, en los features, en el chat ni en el `.bat`.

## 3. Cómo llenar el Excel (`data/input/datos_pruebas.xlsx`)
Una hoja por caso (el nombre es el TestCaseId, por ejemplo `CP-ADM-001`). Cada fila es una ejecución independiente.

| Columna | Qué poner | Ejemplo |
|---|---|---|
| Ejecutar | `SI` o `NO` (lista desplegable) | SI |
| IdFila | Único, formato `<TestCaseId>-NN` | CP-ADM-001-01 |
| Descripcion | Propósito de la fila | Límite superior válido |
| LongTitulo | Caracteres del Job Title (el texto se genera solo) | 100 |
| LongDescripcion | Caracteres del Job Description (0 = no se llena) | 400 |
| LongNota | Caracteres de Note (0 = no se llena) | 400 |

Para agregar una fila: copie una existente, cambie el `IdFila` (siguiente número) y los datos. No modifique los encabezados.

**Relación Excel ↔ escenarios:** el feature `features/puestos/CP-ADM-001_registro_puesto.feature` define el escenario una sola vez. Al ejecutar, cada fila con `SI` se convierte en un escenario independiente (tag `@fila:<IdFila>`).

## 4. Uso del menú
Doble clic en `ejecutar_pruebas.bat`. Antes de cada corrida el menú valida el Excel y verifica los pasos (dry-run); si algo falla, no ejecuta y le dice qué corregir. **Cada corrida crea y luego elimina puestos de trabajo en el ambiente de pruebas**, por eso pide confirmación (S/N).

## 5. Leer los resultados
Todo queda en `reports/<fecha_hora>/`:
- `cucumber-report.html`: escenarios, pasos y capturas. Opción 6 del menú.
- `resultados.xlsx`: una fila por IdFila (estado PASÓ/FALLÓ/OMITIDO, paso que falló, error, rutas a evidencias).
- `evidencias/<TestCaseId>/<IdFila>/`: `trace.zip`, `video.webm` y capturas `.png` (opción 7).
- **Abrir un trace:** opción 8 e ingrese el IdFila (usa `npx playwright show-trace`).

**Diagnóstico de un fallo:** reporte HTML → paso fallido → captura → trace → video.

## 6. Problemas comunes
| Síntoma | Solución |
|---|---|
| "Faltan las credenciales de prueba" | Complete `E2E_USER` y `E2E_PASSWORD` en `.env`. |
| El login no llega al dashboard | Verifique usuario/clave y que el sitio esté disponible. |
| "Hoja ..., fila ..., columna ...: ..." | Corrija esa celda del Excel como indica el mensaje. |
| "Faltan dependencias o navegadores" | Opción 10 del menú. |
| Un puesto quedó sin eliminar | Revise la columna *Notas* de `resultados.xlsx` y elimínelo manualmente en Admin → Job → Job Titles. |
| Fila con título de 1 carácter falla por "Already Exists" | Ese carácter aleatorio ya existe en el catálogo; vuelva a ejecutar. |

## 7. Seguridad
El trace de Playwright registra lo escrito en los campos (incluida la clave del login). Use credenciales de prueba y no comparta la carpeta `reports/` fuera del equipo.
