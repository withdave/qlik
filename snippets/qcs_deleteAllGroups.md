# Delete all groups from a QCS tenant

This script selects 100 groups at a time from the tenant, and sends a delete request per group to remove them from the tenant. 

Notes:
* This uses a deprecated API, which may stop working at any time
* Groups will be repopulated the next time a user logs into the tenant (their groups)
* If the script prints "No groups found." then the initial request either returned no groups or an error

```
# Assign result of groups to a groups variable
$groups=$(qlik raw get v1/qlik-groups --query limit=100) | ConvertFrom-Json

# Replay contents of group variable
Write-Host $groups.count "groups returned."

# If there are groups
if ($groups.count > 0) {
    # Now iterate over all groups with a delete command
    $groups | ForEach {

        $group = $_.id
        Write-Host "Deleting group" $_.displayName "("$group")"
        $deleteResponse=$(qlik raw delete v1/qlik-groups/$group)
    }
} else {
    Write-Host "No groups found."
}
```
