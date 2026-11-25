@echo off
cd /d "%~dp0"
title Ebtesamty Dental Clinic Platform

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%ProgramFiles%\nodejs;%PATH%"

echo ======================================================
echo   Launching Ebtesamty Dental Management Platform...
echo ======================================================

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please ensure Node.js is installed.
    pause
    exit /b 1
)

start "" http://localhost:3000
node scripts/start-local.cjs
if errorlevel 1 pause
