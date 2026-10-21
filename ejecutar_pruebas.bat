@echo off
rem ============================================================================
rem  ejecutar_pruebas.bat - Menu para ejecutar las pruebas sin conocer comandos.
rem  - Sin secretos: las credenciales viven en el archivo .env.
rem  - Los filtros viajan por variables de entorno E2E_FILTER_* (no por parametros).
rem  - Antes de cada corrida: validacion del Excel (prepare-data) y dry-run.
rem  (Texto en ASCII a proposito: evita problemas de codificacion en cmd.)
rem ============================================================================
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Automatizacion OrangeHRM - Puestos de trabajo

if not exist "package.json" goto :sin_extraer
where node >nul 2>&1
if errorlevel 1 goto :sin_node
for /f "tokens=1 delims=." %%v in ('node -v') do set "NODEMAJOR=%%v"
set "NODEMAJOR=%NODEMAJOR:v=%"
if %NODEMAJOR% LSS 20 goto :node_viejo
goto :menu

:sin_extraer
echo [ERROR] No se encontro package.json junto a este archivo.
echo Probablemente esta ejecutando el .bat desde DENTRO del zip.
echo Haga clic derecho en el zip, elija "Extraer todo...", y ejecute el .bat desde la carpeta extraida.
pause
exit /b 1

:sin_node
echo [ERROR] No se encontro Node.js. Instale la version 20 o superior desde https://nodejs.org
pause
exit /b 1

:node_viejo
echo [ERROR] Se requiere Node.js 20 o superior. Version instalada:
node -v
pause
exit /b 1

:menu
set "E2E_FILTER_CASE="
set "E2E_FILTER_ROW="
set "E2E_FILTER_TAG="
set "E2E_TRACE_ROW="
set "MODO=normal"
cls
echo ==========================================================
echo   AUTOMATIZACION OrangeHRM - Puestos de trabajo (Job Titles)
echo ==========================================================
echo   1. Ejecutar todas las filas habilitadas
echo   2. Ejecutar un caso especifico
echo   3. Ejecutar una fila especifica
echo   4. Ejecutar por tag
echo   5. Ejecutar en modo visible (headed)
echo   6. Abrir el ultimo reporte HTML
echo   7. Abrir la carpeta de evidencias de la ultima ejecucion
echo   8. Abrir el trace de una fila
echo   9. Abrir la plantilla Excel
echo  10. Instalar o actualizar dependencias (primera vez)
echo   0. Salir
echo ==========================================================
set "OPC="
set /p "OPC=Seleccione una opcion: "
if "%OPC%"=="1" goto :ejecutar
if "%OPC%"=="2" goto :op_caso
if "%OPC%"=="3" goto :op_fila
if "%OPC%"=="4" goto :op_tag
if "%OPC%"=="5" goto :op_headed
if "%OPC%"=="6" goto :op_html
if "%OPC%"=="7" goto :op_evid
if "%OPC%"=="8" goto :op_trace
if "%OPC%"=="9" goto :op_excel
if "%OPC%"=="10" goto :op_instalar
if "%OPC%"=="0" exit /b 0
goto :menu

:op_caso
echo.
echo Casos disponibles:
call npm run --silent listar
set /p "E2E_FILTER_CASE=Escriba el TestCaseId: "
goto :ejecutar

:op_fila
echo.
set /p "E2E_FILTER_ROW=Escriba el IdFila (ejemplo CP-ADM-001-01): "
goto :ejecutar

:op_tag
echo.
set /p "E2E_FILTER_TAG=Escriba el tag (ejemplo @puestos): "
goto :ejecutar

:op_headed
set "MODO=headed"
goto :ejecutar

:ejecutar
if not exist node_modules goto :falta_modulos
if not exist ".env" goto :falta_env
findstr /r /c:"^E2E_USER=." ".env" >nul
if errorlevel 1 goto :env_incompleto
findstr /r /c:"^E2E_PASSWORD=." ".env" >nul
if errorlevel 1 goto :env_incompleto
if not exist "%LOCALAPPDATA%\ms-playwright" goto :falta_navegador
echo.
echo ATENCION: esta ejecucion CREA y luego ELIMINA puestos de trabajo en el ambiente de pruebas.
set "CONF="
set /p "CONF=Desea continuar? S/N: "
if /i not "%CONF%"=="S" goto :menu
echo.
echo [1/4] Validando el Excel y preparando los datos...
call npm run --silent prepare-data
if errorlevel 1 goto :fallo_previo
echo [2/4] Verificando los pasos de los escenarios (dry-run)...
call npm run --silent dryrun
if errorlevel 1 goto :fallo_previo
echo [3/4] Ejecutando las pruebas...
if "%MODO%"=="headed" (
  call npm run --silent test:headed
) else (
  call npm run --silent test
)
set "RC=!errorlevel!"
echo [4/4] Generando resultados.xlsx y resumen...
call npm run --silent report
echo.
if "!RC!"=="0" (
  echo [OK] La ejecucion termino sin fallos.
) else (
  echo [FALLO] Hubo pruebas fallidas. Revise el reporte HTML y las evidencias.
)
pause
goto :menu

:fallo_previo
echo.
echo [ERROR] No se ejecutaron las pruebas. Corrija lo indicado arriba.
pause
goto :menu

:falta_modulos
echo.
echo [AVISO] Falta la carpeta node_modules: las dependencias no estan instaladas.
echo Use la opcion 10 y revise que termine sin errores.
pause
goto :menu

:falta_navegador
echo.
echo [AVISO] Falta el navegador de Playwright. Ejecute la opcion 10 completa,
echo o en una ventana cmd dentro de esta carpeta: npx playwright install chromium
pause
goto :menu

:falta_instalar
echo.
echo [AVISO] Faltan dependencias o navegadores. Use la opcion 10 primero.
pause
goto :menu

:env_incompleto
echo.
echo [AVISO] El archivo .env no tiene E2E_USER y/o E2E_PASSWORD con valor.
echo Deben quedar asi, sin espacios ni comillas:
echo     E2E_USER=su_usuario
echo     E2E_PASSWORD=su_clave
echo Verifique ademas que el archivo se llame exactamente .env y no .env.txt
echo Se abrira el archivo para que lo complete. Guarde y vuelva a ejecutar.
start "" notepad ".env"
pause
goto :menu

:falta_env
echo.
echo [AVISO] No existe el archivo .env. Use la opcion 10 para crearlo y complete E2E_USER y E2E_PASSWORD.
pause
goto :menu

:op_html
call npm run --silent abrir -- html
pause
goto :menu

:op_evid
call npm run --silent abrir -- evidencias
pause
goto :menu

:op_trace
set /p "E2E_TRACE_ROW=Escriba el IdFila (ejemplo CP-ADM-001-01): "
call npm run --silent abrir -- trace
pause
goto :menu

:op_excel
if not exist "data\input\datos_pruebas.xlsx" call npm run --silent plantilla
start "" "data\input\datos_pruebas.xlsx"
goto :menu

:op_instalar
echo.
echo Instalando dependencias...
call npm install
if errorlevel 1 goto :fallo_instalar
call npx playwright install chromium
if errorlevel 1 goto :fallo_instalar
if not exist ".env" copy ".env.example" ".env" >nul
call npm run --silent plantilla
echo.
echo [OK] Instalacion terminada. Abra el archivo .env y complete E2E_USER y E2E_PASSWORD.
start "" notepad ".env"
pause
goto :menu

:fallo_instalar
echo.
echo [ERROR] La instalacion fallo. Revise su conexion a internet y vuelva a intentar.
pause
goto :menu
