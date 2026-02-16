; Custom NSIS script to close running app before install
; This prevents "App cannot be closed" error during installation

!macro customInit
  ; Close AutoJobzy.exe if running
  nsExec::ExecToStack 'taskkill /F /IM AutoJobzy.exe'
  Pop $0
  Pop $1
!macroend

!macro customInstall
  ; Ensure app is closed before copying files
  ${nsProcess::FindProcess} "AutoJobzy.exe" $R0
  ${If} $R0 == 0
    DetailPrint "Closing AutoJobzy..."
    ${nsProcess::KillProcess} "AutoJobzy.exe" $R0
    Sleep 2000
  ${EndIf}
  ${nsProcess::Unload}
!macroend
