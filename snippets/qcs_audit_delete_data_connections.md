# Auditing and deleting data connections by type

It is not possible to disable specific data connection types on QSE SaaS.

Instead, we could automate the platform to proactively search for and remove data connections that are not approved for use. 

Process:
- Return data connections
- Delete those which shouldn't be present
- Store information on the deleted connections and owners

## Script 

The script grabs all data connections, creates a new object containing the type we're after, then blindly deletes the connections from the object.

It also stores a list of the connections it's about to delete as a CSV into the same directory prior to deleting them.

```
# This script doesn't do error handling or tracking, it simply 'does'
# Set the connection type to delete
$connectionToDeleteType = 'File_AmazonS3Connector';

# Grab all non-datafiles connections
$dataConnections = qlik raw get v1/data-connections --query noDatafiles=true | ConvertFrom-Json

# Create a new object containing only those with the connection type we're after
$connectionsToDelete = Foreach ($dataConnection in $dataConnections) {
    If ($dataConnection.datasourceID -eq $connectionToDeleteType) {
        New-Object PSObject $dataConnection;
    }
}

# Store this object down into a CSV before we try to run deletes
$connectionsToDelete | Export-Csv -Path ".\ConnectionsToDelete_$($connectionToDeleteType)_$(get-date -f yyyyMMdd_hhmmss).csv" -NoTypeInformation

# Create a new object containing only those with the connection type we're after
Foreach ($connectionToDelete in $connectionsToDelete) {
    If ($connectionToDelete.datasourceID -eq $connectionToDeleteType) {
        qlik raw delete v1/data-connections/$($connectionToDelete.id)
    }
}

```

## Script to generate dummy data connections on S3

This script generates 100 dummy S3 data connections to test the audit script above. Change the connection owner and space ID prior to running.

```
for ($i=1; $i -lt 101; $i++) {

    $ownerID = "<owner user id>"
    $s3Bucket = "my-best-bucket-$i"
    $s3BucketRegion = "eu-west-1"
    $connectionName = "A test S3 connection that should not be here ($i)"
    $accessKey = ""
    $secretKey = ""
    $spaceID = "<target space id>"
    $payload = @{
        "datasourceID"      = "File_AmazonS3Connector"
        "owner"             = "$ownerID"
        "qConnectStatement" = "CUSTOM CONNECT TO `\provider=QvWebStorageProviderConnectorPackage.exe; sourceType=File_AmazonS3Connector; region=$s3BucketRegion; bucketName=$s3Bucket;`\"
        "qName"             = "$connectionName"
        "qType"             = "QvWebStorageProviderConnectorPackage.exe"
        "qUsername"         = $null
        "qPassword"         = "mysupersecurekey"
        "space"             = "$spaceID"
    }
    $payload = ConvertTo-Json $payload | % { $_ -replace '"', '\"' } | % { $_ -replace '\\\\', '\\\"' }
    qlik raw post v1/data-connections --body $payload --verbose;
}

```

