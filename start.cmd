@echo off
cd /d "%~dp0"
set "PATH=%~dp0.tools\node-v22.23.4-win-x64;%PATH%"
if not exist node_modules call npm install --no-audit --no-fund
call npm run dev
