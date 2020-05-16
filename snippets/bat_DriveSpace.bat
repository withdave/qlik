@echo off
:: Batch file to log out a local drive report to a .log file in the same directory
:: Log files are named based on the date and time

:: Specify which servers to attempt to return disk space for (delimit with spaces)
:: Enter hostname, and ensure the account running this script has local or domain admin rights
set SERVER_LIST=server

:: Set output date time (YYYYMMDD_hhmmss)
set LOG_TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set LOG_DATE=%date:~-4,4%%date:~-7,2%%date:~0,2%
set LOG_TIME=%time:~0,2%%time:~3,2%%time:~6,2%

:: Specify output prefix
set LOG_LOCATION=DriveReport_%LOG_TIMESTAMP%.log

:: Create empty output file
>nul copy nul %LOG_LOCATION%

:: Loop over each server to return stats and append to log file
echo ServerName,LogDate,LogTime,Drive,Size,FreeSpace>>%LOG_LOCATION%
for %%i in (%SERVER_LIST%) do (

    for /f "tokens=1,2,3" %%a in ('wmic /node:"%%i" LogicalDisk Where DriveType^="3" Get DeviceID^,Size^,FreeSpace^|find ":"') do @echo %%i,%LOG_DATE%,%LOG_TIME%,%%a,%%c,%%b>>%LOG_LOCATION%

)
