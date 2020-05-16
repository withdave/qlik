@Echo Off
:: ServiceCheck.bat
:: Accepts a service name, if it's running, exits. If it's not running, attempts to start it and creates a log file.
:: Uplift to check and retry?

Set ServiceName=%~1
::Set ServiceName=QlikSenseProxyService

:: Get date in yyyyMMdd_HHmm format to use with file name.
FOR /f "usebackq" %%i IN (`PowerShell ^(Get-Date^).ToString^('yyyy-MM-dd'^)`) DO SET LogDate=%%i

SC queryex "%ServiceName%"|Find "STATE"|Find /v "RUNNING">Nul&&(
  echo %ServiceName% not running 
  echo Start %ServiceName%
  
  Net start "%ServiceName%">nul||(
    Echo "%ServiceName%" wont start 
    exit /b 1
  )
  
  echo "%ServiceName%" started
  
  :: Now log out to a file so we have some sort of history
  echo ### Service [%ServiceName%] not running on %LogDate% & echo %Time% Attempting to start service.>>"%~dp0ServiceCheck_%ServiceName%_%LogDate%.log"
  exit /b 0
  
)||(
  :: All OK, let's just write to console and exit
  echo "%ServiceName%" working
  exit /b 0
)
