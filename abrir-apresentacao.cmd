@echo off
rem Abre a apresentação SWOT WEALTH neste computador: sobe um servidor local nesta janela e abre o navegador
rem em tela cheia. Para encerrar, feche o navegador e esta janela.
cd /d "%~dp0"
set PORTA=8417
set URL=http://127.0.0.1:%PORTA%/index.html
where python >nul 2>nul
if errorlevel 1 (
  echo Python nao encontrado. Instale o Python 3 ou rode outro servidor HTTP nesta pasta.
  pause
  exit /b 1
)
set NAV=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set NAV="%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined NAV if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set NAV="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if defined NAV (
  start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" %NAV% --start-fullscreen --app=%URL%"
) else (
  start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" %URL%"
)
echo.
echo  SWOT WEALTH - apresentacao em %URL%
echo  Espaco pausa e continua - setas vao de marco em marco - 1, 2, 3 abrem as lentes do Top 3
echo  M abre o material - R reinicia - F11 sai da tela cheia
echo  Feche esta janela para encerrar o servidor.
echo.
python -m http.server %PORTA% --bind 127.0.0.1
