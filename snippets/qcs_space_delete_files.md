# Delete all files in a QCS space

This powershell script requires you to provide a spaceId, and will loop over and delete all data files in a space in chunks.

...use with caution.

```

# Set the space ID
$spaceId = '617acadaf799b587c4740891';

# Get the space's data connections
$dataConnections = qlik raw get v1/data-connections --query spaceId=$spaceId | ConvertFrom-Json

# Find that blasted datafiles connection ID (this is a loop rather than search, sorry)
foreach ($dataConnection in $dataConnections) {

    echo $("Checking connection: " + $dataConnection.qName);

    if ($dataConnection.qName -eq 'DataFiles') {
        
        # Get the data files in that space
        $dataFiles = qlik raw get v1/qix-datafiles --query connectionId=$($dataConnection.id) | ConvertFrom-Json

        # Now remove them by page
        while ($($dataFiles.Length) -gt 1) {
            foreach ($dataFile in $dataFiles) {
                Write-Host "Deleting $($dataFile.name)"
                qlik raw delete v1/qix-datafiles/$($dataFile.id) | Out-Null
            }
            $dataFiles = qlik raw get v1/qix-datafiles --query connectionId=$($dataConnection.id) | ConvertFrom-Json
            Write-Host 'Checking for more files...'
        }
        
        # Break here as we should have only one
        echo $("All data files removed, connection: " + $dataConnection.qName + " matched DataFiles, breaking.");
        break;
    }
}
```
