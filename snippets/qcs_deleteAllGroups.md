# Delete all groups from a Qlik Cloud tenant

This script selects 100 groups at a time from the tenant, and sends a delete request per group to remove them from the tenant.

It is possible to do this via:
* API & CLI
* Application automation

Notes:
* Groups will be repopulated from the user's claims the next time a user logs into the tenant if `Creation of groups` is enabled on the tenant

# CLI deletion of groups

Notes:
* If the script prints "No groups returned." then the initial request either returned no groups or an error
* This works on the first 1000 groups - run multiple times or increase the limit if you have more groups

```
# Assign result of groups to a groups variable
$groups=$(qlik group ls --limit 1000) | ConvertFrom-Json

# Replay contents of group variable
Write-Host $groups.count "groups returned."


# If there are groups
if ($groups.count -ne 0) {
    # Now iterate over all groups with a delete command
    $groups | ForEach {

        $group = $_.id
        Write-Host "Deleting group" $_.displayName "("$group")"
        $deleteResponse=$(qlik group rm $group)
    }
} else {
    Write-Host "No groups found."
}

```

## Automation deletion of groups

Doing this in application automation is very simple. Save this snippet as a JSON file and import it to a workspace to delete all groups in the tenant.

```
{"blocks":[{"id":"53859078-C158-4484-8B86-0CE96DE2DE47","type":"StartBlock","disabled":false,"name":"Start","displayName":"Start","comment":"","childId":"B762D871-CB09-4D20-9C13-33C5A07BE77D","inputs":[{"id":"run_mode","value":"manual","type":"select","structure":{}}],"settings":[],"collapsed":[{"name":"loop","isCollapsed":false}],"x":0,"y":0},{"id":"B762D871-CB09-4D20-9C13-33C5A07BE77D","type":"EndpointBlock","disabled":false,"name":"rawAPIListRequest","displayName":"Qlik Cloud Services - Raw API List Request","comment":"","childId":null,"inputs":[{"id":"c3a1c780-2076-11ec-98c4-dd329f9ef682","value":"groups","type":"string","structure":{}},{"id":"c6915fb0-2839-11ec-a450-03c7d8aebbe7","value":null,"type":"object","mode":"keyValue","structure":{}}],"settings":[{"id":"maxitemcount","value":null,"type":"string","structure":{}},{"id":"blendr_on_error","value":"stop","type":"select","structure":{}},{"id":"cache","value":"0","type":"select","structure":{}}],"collapsed":[{"name":"loop","isCollapsed":false}],"x":440,"y":290,"loopBlockId":"3CD5CD8D-BFB0-44D4-BF5C-50B82747E118","datasourcetype_guid":"61a87510-c7a3-11ea-95da-0fb0c241e75c","endpoint_guid":"4b993580-2072-11ec-8f59-e5aaa8656a36","endpoint_role":"list"},{"id":"3CD5CD8D-BFB0-44D4-BF5C-50B82747E118","type":"EndpointBlock","disabled":false,"name":"rawAPIRequest","displayName":"Qlik Cloud Services - Raw API Request","comment":"","childId":null,"inputs":[{"id":"4add8960-2078-11ec-be2c-7fc55d771fe6","value":"groups/{$.rawAPIListRequest.item.id}","type":"string","structure":{}},{"id":"3b992a40-2072-11ec-9f0e-ed01586a7e1b","value":"3ba2a970-2072-11ec-be02-2dd5c73abb12","type":"select","displayValue":"DELETE","structure":{}},{"id":"3b8b9090-2072-11ec-8c77-5195fbb0ca65","value":null,"type":"object","mode":"keyValue","structure":{}},{"id":"993585d0-2839-11ec-b431-df4deed6c1ae","value":null,"type":"object","mode":"keyValue","structure":{}}],"settings":[{"id":"blendr_on_error","value":"stop","type":"select","structure":{}},{"id":"cache","value":"0","type":"select","structure":{}}],"collapsed":[{"name":"loop","isCollapsed":false}],"x":-282,"y":94,"datasourcetype_guid":"61a87510-c7a3-11ea-95da-0fb0c241e75c","endpoint_guid":"3b75dd80-2072-11ec-9043-3b2aff6123af","endpoint_role":"get"}],"variables":[]}
```
