# Delete all groups from a Qlik Cloud tenant

This script selects 100 groups at a time from the tenant, and sends a delete request per group to remove them from the tenant. 

Notes:
* Groups will be repopulated from the user's claims the next time a user logs into the tenant if `Creation of groups` is enabled on the tenant
* If the script prints "No groups returned." then the initial request either returned no groups or an error
* If you have more than 100 groups, you will need to run this script multiple times since it does not paginate

```
# Assign result of groups to a groups variable
$groups=$(qlik raw get v1/qlik-groups --query limit=100) | ConvertFrom-Json

# Replay contents of group variable
Write-Host $groups.count "groups returned."


# If there are groups
if ($groups.count -ne 0) {
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
