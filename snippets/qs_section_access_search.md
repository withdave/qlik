# Section Access Search

This powershell script helps identify where apps have section access through analysis of the script logs.

It:
* Creates an array of unique app GUIDs in the script log directory
* Iterates over each unique ID to scan the last modified log file for each for the phrase "Section Access"
* Appends any data found to a CSV log file


```
# Set the path to the script logs - default C:\ProgramData\Qlik\Sense\Log\Script
$LogPath = 'C:\ProgramData\Qlik\Sense\Log\Script';

# Get all app IDs that have a .log file from every reload (in case there are published apps with broken reloads) 
$LogFiles = Get-ChildItem $LogPath -filter *.log | 
    ForEach-Object {
        Write-Output $_.BaseName.Split('.')[0];
    } | 
    Group-Object |
    Sort-Object -Property Name |
    Select-Object Name;

# Iterate over each unique filename and search only the latest file for each GUID
$LogFiles | 
    foreach {
        $ScriptLog = $_.Name;
        Get-ChildItem -Path $LogPath -filter $ScriptLog*.log | Sort-Object -Descending -Property LastWriteTime | Select -First 1 | Select-String -Pattern 'Section Access' | Export-CSV -Append -Path 'C:\Temp\SectionAccess.csv'
    }
```
