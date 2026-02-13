@echo off
REM AutoJobzy Windows Troubleshooting Script
REM This script checks for common issues and provides solutions

echo ============================================================
echo   AutoJobzy Windows Troubleshooting Tool
echo ============================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator
) else (
    echo [WARNING] Not running as Administrator
    echo           Right-click this script and select "Run as administrator"
)
echo.

REM Check Windows version
echo Checking Windows version...
ver | findstr /i "10\. 11\." >nul
if %errorLevel% == 0 (
    echo [OK] Windows 10/11 detected
) else (
    echo [WARNING] Windows version may not be supported
    echo           AutoJobzy requires Windows 10 or later
)
echo.

REM Check if Visual C++ Redistributable is installed
echo Checking Visual C++ Redistributable...
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Visual C++ Redistributable found
) else (
    echo [WARNING] Visual C++ Redistributable not found
    echo           Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe
)
echo.

REM Check if AutoJobzy is installed
echo Checking AutoJobzy installation...
if exist "%ProgramFiles%\AutoJobzy\AutoJobzy.exe" (
    echo [OK] AutoJobzy found at: %ProgramFiles%\AutoJobzy\
) else if exist "%LocalAppData%\Programs\AutoJobzy\AutoJobzy.exe" (
    echo [OK] AutoJobzy found at: %LocalAppData%\Programs\AutoJobzy\
) else (
    echo [WARNING] AutoJobzy not found in standard locations
)
echo.

REM Check Chrome bundled
echo Checking bundled Chrome...
if exist "%ProgramFiles%\AutoJobzy\resources\.chrome-build\chrome" (
    echo [OK] Bundled Chrome found
) else if exist "%LocalAppData%\Programs\AutoJobzy\resources\.chrome-build\chrome" (
    echo [OK] Bundled Chrome found
) else (
    echo [INFO] Bundled Chrome not found - will download on first run
)
echo.

REM Check antivirus (Windows Defender)
echo Checking Windows Defender status...
powershell -Command "Get-MpComputerStatus | Select-Object AntivirusEnabled" | findstr "True" >nul
if %errorLevel% == 0 (
    echo [INFO] Windows Defender is enabled
    echo       If AutoJobzy is blocked, add it to exclusions:
    echo       Settings -^> Update ^& Security -^> Windows Security -^> Virus ^& threat protection
    echo       -^> Manage settings -^> Add exclusion -^> Folder -^> %ProgramFiles%\AutoJobzy
)
echo.

REM Check disk space
echo Checking disk space...
for /f "tokens=3" %%a in ('dir C:\ ^| findstr "bytes free"') do set freespace=%%a
echo [INFO] Free space on C: drive: %freespace% bytes
echo       AutoJobzy requires at least 500 MB free space
echo.

REM Check internet connection
echo Checking internet connection...
ping -n 1 google.com >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Internet connection available
) else (
    echo [WARNING] No internet connection detected
    echo           Internet is required for job automation
)
echo.

REM Check firewall status
echo Checking Windows Firewall...
netsh advfirewall show allprofiles state | findstr "ON" >nul
if %errorLevel% == 0 (
    echo [INFO] Windows Firewall is enabled
    echo       If automation fails, check firewall settings
)
echo.

echo ============================================================
echo   Troubleshooting Complete
echo ============================================================
echo.
echo Common Solutions:
echo.
echo 1. Install Visual C++ Redistributable if missing
echo 2. Add AutoJobzy to antivirus exclusions
echo 3. Run AutoJobzy as Administrator
echo 4. Check internet connection for automation
echo 5. Restart computer after installation
echo.
echo If issues persist, check INSTALLATION_GUIDE.md
echo.
pause
