# Create users and assign licenses on a QCS tenant

## Approach

This script:
1) Defines the tenant ID
2) Loads the planned user list from a CSV file
3) Uses Qlik CLI to create the users
4) Uses the QCS APIs to assign users licenses (due to a bug in the CLI on this endpoint) 

This will not overwrite or amend licenses already assigned.

## Input 

The input for this script is a CSV file which provides required user information and their associated license type.

In the example below, some users aren't assigned licenses, which the script will report but not fail on.

| UserSubject | UserEmail           | UserName | UserLicense  |
|-------------|---------------------|----------|--------------|
| test\user1  | user1@mydomain.com  | User 1   | professional |
| test\user2  | user2@mydomain.com  | User 2   | analyzer     |
| test\user3  | user3@mydomain.com  | User 3   | professional |
| test\user4  | user4@mydomain.com  | User 4   | professional |
| test\user5  | user5@mydomain.com  | User 5   | analyzer     |
| test\user6  | user6@mydomain.com  | User 6   | professional |
| test\user7  | user7@mydomain.com  | User 7   | analyzer     |
| test\user8  | user8@mydomain.com  | User 8   |              |
| test\user9  | user9@mydomain.com  | User 9   |              |
| test\user10 | user10@mydomain.com | User 10  |              |
| test\user11 | user11@mydomain.com | User 11  | professional |
| test\user12 | user12@mydomain.com | User 12  | analyzer     |
| test\user13 | user13@mydomain.com | User 13  |              |
| test\user14 | user14@mydomain.com | User 14  |              |
| test\user15 | user15@mydomain.com | User 15  | professional |
| test\user16 | user16@mydomain.com | User 16  | analyzer     |
| test\user17 | user17@mydomain.com | User 17  | professional |
| test\user18 | user18@mydomain.com | User 18  | analyzer     |
| test\user19 | user19@mydomain.com | User 19  | professional |
| test\user20 | user20@mydomain.com | User 20  | analyzer     |


## Script

```
# We need to get the tenant ID. Either specify it, or run the below to grab it
# If you know it...
$tenantId = '';

# If you don't know it...get it from somewhere that this API key has access to
$apiKeys = qlik api-key ls | ConvertFrom-Json
$tenantId = $apiKeys[0].tenantId
  
# Load our user list from CSV
$pathUsers = "C:\path\qcs_user_provisioning.csv"
$users = Import-Csv -Path $Path

function license-assignment-add {
    # This isn't great, but this endpoint is experimental and going via CLI doesn't currently work correctly (should be fixed soon)
    # This requires the tenant URL plus the API key (could also pull this from CLI)
    param(
        [parameter (position=0)]
        [string]$subject,
        [parameter (position=1)]
        [validateset(ignorecase=$false,'professional','analyzer')]
        [string]$type
    )

    # Define your tenant URL
    $tenant = "saas.us.qlikcloud.com"

    # Define your API key
    $apikey = "YOURKEY"

    # Dummy value for the headers
    $hdrs = @{}

    # Add in the API key to the headers
    $hdrs.Add("Authorization","Bearer $($apikey)")

    # Handle TLS 1.2 only environments
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]'Ssl3,Tls,Tls11,Tls12'

    # Construct the payload
    $payload = @([pscustomobject]@{
        "subject"          = $subject
        "type"             = $type
        })

    # Construct the request to match the schema
    $assignment = @{
        "add" = $payload
    } | ConvertTo-Json

    # Send the post request to create the assignment
    Invoke-WebRequest -Method post -Uri "https://$($tenant)/api/v1/licenses/assignments/actions/add" -Headers $hdrs -Body $assignment -Verbose

}

# Loop over each user in the list
foreach ($user in $users) {
    
    # Print out what we're trying to do
    Write-Host "Attempting to create " $user.UserSubject " with " $user.UserLicense  " license"
    
    # Create the user (will display an error if the email already exists)
    $createUser = qlik user create --email $user.UserEmail --name $user.UserName --subject $user.UserSubject --tenantId $tenantId

    # Assign a license to the user (to test whether this replaces/ adds)
    $assignUser = license-assignment-add $user.UserSubject $user.UserLicense 

}

```
