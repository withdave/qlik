# Auditing and deleting data connections by type

It is not possible to disable specific data connection types on QSE SaaS.

Instead, we could automate the platform to proactively search for and remove data connections that are not approved for use. 

Process:
- Return data connections
- Delete those which shouldn't be present
- Store information on the deleted connections and owners

## Script 

In progress

```
In progress

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

