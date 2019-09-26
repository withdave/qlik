# Backup QS - simple branch of qlik_migrate/blob/master/site_backup.ps1 (internal only)
# Will copy connectors but nothing like web connectors, or on-system services

# First drop all the restrictions on script execution (depends on policy)
#Set-ExecutionPolicy Unrestricted

# Need to set the PGP Pass file
# PGPASS must have: localhost:4432:QSR:Postgres:[superuserpassword]
SET PGPASSFILE=C:\Backups\Qlik\pgpass.conf

# Set start date and time
$Today = Get-Date -UFormat “%Y%m%d_%H%M”
$StartTime = Get-Date -UFormat “%Y%m%d_%H%M”

# Set usual postgres and program data locations
$PostGreSQLLocation = “C:\Program Files\Qlik\Sense\Repository\PostgreSQL\9.6\bin”
$PostGresBackupTarget = “C:\Backups\Qlik”
$SenseProgramData = “C:\QlikShare\” # Shared Persistance Folder

# Write out to console
write-host “Attempting to shut down Qlik Sense services.”

# Put some loginc in here and log when these don't go down
# Also add more status updates as there is no indication of progress
# Is -WarningAction SilentlyContinue appropriate?
stop-service QlikSenseProxyService -WarningAction SilentlyContinue
Start-Sleep -s 10
stop-service QlikSenseEngineService -WarningAction SilentlyContinue
Start-Sleep -s 10
stop-service QlikSenseSchedulerService -WarningAction SilentlyContinue
Start-Sleep -s 10
stop-service QlikSensePrintingService -WarningAction SilentlyContinue
Start-Sleep -s 10
stop-service QlikSenseServiceDispatcher -WarningAction SilentlyContinue
Start-Sleep -s 10
stop-service QlikSenseRepositoryService -WarningAction SilentlyContinue
# Add logging service in case we want to dump this too
Start-Sleep -s 10
Stop-Service QlikLoggingService -WarningAction SilentlyContinue

# Write out to console
write-host “Backing up Shared Persistance Data from $SenseProgramData.”

# Copy Qlik Sense logs, apps, and other core content
Copy-Item $SenseProgramData\ArchivedLogs -Destination $PostGresBackupTarget\$StartTime\ArchivedLogs -Recurse
Copy-Item $SenseProgramData\Apps -Destination $PostGresBackupTarget\$StartTime\Apps -Recurse
Copy-Item $SenseProgramData\StaticContent -Destination $PostGresBackupTarget\$StartTime\StaticContent -Recurse
Copy-Item $SenseProgramData\CustomData -Destination $PostGresBackupTarget\$StartTime\CustomData -Recurse

# Write out to console
write-host “File Backup Completed”

# Script can get lost here - waits for user to hit enter on prompt for password if we don't use the pgpass
write-host “Backing up PostgreSQL Repository Database”

# Change to postgres folder and execute dump (use pg_pass)
cd $PostGreSQLLocation
.\pg_dump.exe -h localhost -p 4432 -U postgres -b -F t -f “$PostGresBackupTarget\$StartTime\QSR_backup_$Today.tar” QSR

# Write out to console
write-host “PostgreSQL backup Completed, restarting Qlik Services”

# Delay to make sure services can talk to each other
start-service QlikSenseRepositoryService -WarningAction SilentlyContinue
Start-Sleep -s 10
start-service QlikSenseEngineService -WarningAction SilentlyContinue
Start-Sleep -s 10
start-service QlikSenseSchedulerService -WarningAction SilentlyContinue
Start-Sleep -s 10
start-service QlikSensePrintingService -WarningAction SilentlyContinue
Start-Sleep -s 10
start-service QlikSenseServiceDispatcher -WarningAction SilentlyContinue
Start-Sleep -s 10
start-service QlikSenseProxyService -WarningAction SilentlyContinue

# Set end time
$EndTime = Get-Date -UFormat “%Y%m%d_%H%M%S”

# Write out to console
write-host “This backup process started at ” $StartTime ” and ended at ” $EndTime
