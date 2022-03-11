# Updating owners and spaces on objects

This page documents how to change the owner and space properties on different resource types. 

API examples will be written using Qlik CLI where possible.

## Object types and coverage

GUI and API availability varies per resource type in SaaS.

| Resource Type | Change owner in GUI | Change owner in API | Change space in GUI | Change space in API |
| --- | --- | --- | --- | --- |
| Apps | Yes | Yes | Yes | Yes |
| App Objects | No | No | N/A | N/A |
| Data Connections | No | No | Yes | Yes |
| Data Files | ? | ? | ? | ? |
| Spaces | Yes | Yes | N/A | N/A |


## App Objects

### Change owner via GUI

This is not currently possible.

### Change owner via API

This is not currently possible, as the object owner can't updated via the items API.

It may be possible to script the rebuild of objects (using unbuild/ build) and impersonation (using JWT).

## Data Connections

### Change owner via GUI

This is not currently possible.

### Change owner via API

This is not currently possible, as the owner is not surfaced via the data-connections API.

### Change space via GUI

Navigate to Management console > Data content, and there is an option to "move" any data connection (go to https://{tenant}.{region}.qlikcloud.com/console/content/data-connections)

### Change space via API

This is possible, although not super clean. The results may not be perfect where connections have encrypted credentials. 

You could also try a patch request.

```
# Script to do this in native PS as qlik CLI seems a bit buggy on this endpoint

# Define your tenant URL
$tenant = "tenant.region.qlikcloud.com"

# Define your API key
$apikey = "myapikey"

# Define your data connection ID
$dataconnid = "id of the data connection"

# Define your target space
$space = "id of the target space"

# Dummy value for the headers
$hdrs = @{}

# Add in the API key to the headers
$hdrs.Add("Authorization","Bearer $($apikey)")

# Handle TLS 1.2 only environments
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]'Ssl3,Tls,Tls11,Tls12' 

# Get the Data Connection Info
$dataconn = Invoke-WebRequest -Method Get -Uri "https://$($tenant)/api/v1/data-connections/$($dataconnid)" -Headers $hdrs | ConvertFrom-Json

# Create the payload for updating the data connection
$payload = @{
        "qId"               = $dataconn.qId
        "qName"             = $dataconn.qName
        "qConnectStatement" = $dataconn.qConnectStatement
        "qType"             = $dataconn.qType
        "qEngineObjectID"   = $dataconn.qEngineObjectID
        "space"             = $space
    } | ConvertTo-Json
$payload = ConvertTo-Json $payload 

# Send the post request to update the data connection
$dataconnresp = Invoke-WebRequest -Method put -Uri "https://$($tenant)/api/v1/data-connections/$($dataconnid)" -Headers $hdrs -Body $payload
```

## Spaces

### Change owner via GUI

This can be done from the QMC at https://{tenant}.{region}.qlikcloud.com/console/spaces/

### Change owner via API

This is simple and requires just the ID for the space and the user who will own the resource.
```
qlik space update {spaceId} --ownerId {userId}

example:
qlik space update 6176c4aae25328b217e952e2 --ownerId oVtOVXb4qg1oXZn7nF-LSh960MUnetxN
```
