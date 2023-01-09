# Delete all files in a Qlik Cloud space

This powershell script requires you to provide a spaceId, and will loop over and delete all data files in a space in chunks.

...use with caution.

```


# Set the space ID
$spaceId = '63bc52d878cff58eaeda4c58';

# Get the space's data connections
$dataConnections = qlik raw get v1/data-connections --query spaceId=$spaceId | ConvertFrom-Json

# Find that blasted datafiles connection ID (this is a loop rather than search, sorry)
foreach ($dataConnection in $dataConnections) {

    echo $("Checking connection: " + $dataConnection.qName);

    if ($dataConnection.qName -eq 'DataFiles') {

        # We got it
        echo $("Found DataFiles connection: " + $dataConnection.qName + ", id: " + $dataConnection.id);
        
        # Get the data files in that space
        $dataFiles = qlik data-file ls --connectionId $($dataConnection.id) | ConvertFrom-Json

        # Now remove them by page
        while ($($dataFiles.Length) -gt 1) {
            foreach ($dataFile in $dataFiles) {
                Write-Host "Deleting $($dataFile.name) with id $($dataFile.id)"
                qlik raw delete v1/data-files/$($dataFile.id) | Out-Null
            }
            $dataFiles = qlik data-file ls --connectionId $($dataConnection.id) | ConvertFrom-Json
            Write-Host 'Checking for more files...'
        }
        
        # Break here as we should have only one
        echo $("All data files removed, connection: " + $dataConnection.qName + " matched DataFiles, breaking.");
        break;
    }
}
```
