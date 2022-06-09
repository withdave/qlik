// Bring in config file with values for the qcs const below, template is in the package
const config = require('./qct_config.json');

// Configure for your Qlik Cloud deployment
const qcs = {
    targetTenant: 'name', // the tenant that you wish to configure, e.g. name for name.eu.qlikcloud.com
    region: config.region, // Qlik Cloud region URL e.g. name.eu.qlikcloud.com becomes eu.qlikcloud.com
    regionClientId: config.regionClientId, // our oauth client id, generated in MyQlik, e.g. '12345678912345678'
    regionClientSecret: config.regionClientSecret // our oauth client secret, generated in MyQlik, e.g. 'eac0dswfec23ewfweweg2g2vsebw77e1cce'
}

// This example uses just https, you may want to use a package
const https = require('https')

let deploySpaces = [{
    spaceName: 'Finance staging',
    spaceDesc: 'Staging area for deployment of finance applications, for the "ADMIN" user group',
    spaceType: 'shared',
    members: [
        {
            "type": "group",
            "name": "admin",
            "roles": [
                "consumer",
                "dataconsumer",
                "facilitator",
                "producer"
            ]
        }, {
            "type": "group",
            "name": "finance",
            "roles": [
                "consumer"
            ]
        }]
},
{
    spaceName: 'Finance',
    spaceDesc: 'Applications for the "FINANCE" user group',
    spaceType: 'managed'
}, {
    spaceName: 'Marketing staging',
    spaceDesc: 'Staging area for deployment of marketing applications, for the "ADMIN" user group',
    spaceType: 'shared'
},
{
    spaceName: 'Marketing',
    spaceDesc: 'Applications for the "MARKETING" user group',
    spaceType: 'managed'
}, {
    spaceName: 'IT staging',
    spaceDesc: 'Staging area for deployment of IT applications, for the "ADMIN" user group',
    spaceType: 'shared'
},
{
    spaceName: 'IT',
    spaceDesc: 'Applications for the "IT" user group',
    spaceType: 'managed'
}]


// Prepare our oauth cred package for future auth requests
const oauthClientData = JSON.stringify({
    client_id: qcs.regionClientId,
    client_secret: qcs.regionClientSecret,
    grant_type: "client_credentials"
})

// Prepare target tenant URL
const targetTenantUrl = qcs.targetTenant + '.' + qcs.region;

// Function to handle our requests
function httpsRequest(params, postBody) {
    return new Promise(function (resolve, reject) {
        var req = https.request(params, function (res) {

            // There is no error handling on HTTP response codes here
            // In your application, you should handle these responses in either the request handler or your calls
            //console.log(res);

            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    // Here to catch empty responses and play them back nicely
                    body = 'Status ' + res.statusCode + 'r/n/' + body;
                }
                resolve(body);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
        if (postBody) {
            req.write(postBody);
        }
        req.end();
    });
}

async function deployToTenant() {

    // ***************************
    // 1 - Get access token for target tenant, for use will all future requests
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, oauthClientData);
    // For the demo, log out the response
    console.log('Output from step 1: ' + JSON.stringify(data));
    // Save access token for next request
    let targetTenantToken = data.access_token;
    

    // ***************************
    // 2 - Loop through spaces
    for (let spaceKey in deploySpaces) {
        var iter = parseInt(spaceKey) + 1;
        console.log('Deploying space ' + iter + '/' + deploySpaces.length + ' <' + deploySpaces[spaceKey].spaceName + '>');

        // Build space body
        var spaceData = JSON.stringify(
            {
                name: deploySpaces[spaceKey].spaceName,
                description: deploySpaces[spaceKey].spaceDesc,
                type: deploySpaces[spaceKey].spaceType
            }
        );

        // 2.iter.1 - Send space creation requests
        var data = await httpsRequest({
            hostname: targetTenantUrl,
            port: 443,
            path: '/api/v1/spaces',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + targetTenantToken
            }
        }, spaceData);
        // For the demo, log out the response
        console.log('Output from step 2.' + iter + '.1: ' + JSON.stringify(data));

        // Quick check in case space already created (just so that we gracefully handle this one error)
        if (data.code == 'SpaceNameConflict') {
            var data = await httpsRequest({
                hostname: targetTenantUrl,
                port: 443,
                path: '/api/v1/spaces?type=' + deploySpaces[spaceKey].spaceType + '&name='+encodeURIComponent(deploySpaces[spaceKey].spaceName),
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + targetTenantToken
                }
            });
            
            // Set returned var for use in assignment
            var spaceId = data.data[0].id;
            console.log('There was an issue with creating the space, retrieving id: ' + JSON.stringify(data));
        } else {
            // Set returned var for use in assignment
            var spaceId = data.id;
        }

        for (let memberKey in deploySpaces[spaceKey].members) {
            var iterMember = parseInt(memberKey) + 1;
            // Only do the group requests to keep this simple
            if (deploySpaces[spaceKey].members[memberKey].type == 'group') {
                // First get the group id (we only have the name)
                // This is a bit dumb, you should improve this
                var data = await httpsRequest({
                    hostname: targetTenantUrl,
                    port: 443,
                    path: '/api/v1/groups?filter=' + encodeURIComponent('name eq "' + deploySpaces[spaceKey].members[memberKey].name + '"'),
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + targetTenantToken
                    }
                }, spaceData);

                // Print out our group ID for validation
                console.log('Output from step 2.' + iter + '.2.' + iterMember + '.1: Group id for <' + deploySpaces[spaceKey].members[memberKey].name + '> is <' + data.data[0].id + '>, to be assigned to space id ' + spaceId);

                // Build assignment payload
                var assignmentData = JSON.stringify({
                    "type": deploySpaces[spaceKey].members[memberKey].type,
                    "assigneeId": data.data[0].id,
                    "roles": deploySpaces[spaceKey].members[memberKey].roles
                });

                // Finally send the assignment request for the space
                var data = await httpsRequest({
                    hostname: targetTenantUrl,
                    port: 443,
                    path: '/api/v1/spaces/' + spaceId + '/assignments',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + targetTenantToken
                    }
                }, assignmentData);
                // For the demo, log out the response
                console.log('Output from step 2.' + iter + '.2.' + iterMember + '.2: ' + JSON.stringify(data));

            } else {
                console.log('Notice: Only groups assignments are implemented by this script.')
            }

        }


    }



};

// Let's deploy content
deployToTenant();