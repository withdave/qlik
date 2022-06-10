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
const https = require('https');


// Prepare our oauth cred package for future auth requests
const oauthClientData = JSON.stringify({
    client_id: qcs.regionClientId,
    client_secret: qcs.regionClientSecret,
    grant_type: "client_credentials"
})

// Prepare target tenant URL
const targetTenantUrlFull = 'https://' + qcs.targetTenant + '.' + qcs.region;


// Function to handle our requests
async function httpsFetch(url, settings) {
    try {
        const fetchResponse = await fetch(url, settings);
        
        try {
            const data = await fetchResponse.json();
        } catch {
            const data = await fetchResponse;
        }

        
        return data;

    } catch (e) {
        return e;
    }
}

async function cleanTenant() {

    // ***************************
    // 1 - Get access token for target tenant, for use will all future requests
    var data = await httpsFetch(targetTenantUrlFull + '/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: oauthClientData
    });

    // For the demo, log out the response
    console.log('Output from step 1: ', data);
    // Save access token for next request
    let targetTenantToken = data.access_token;

    // 2 - Get list of apps and delete them
    var stillPages = true;
    var queryUrl = targetTenantUrlFull + '/api/v1/items?resourceType=app,qvapp&limit=100&noActions=true';
    var pageIter = 0;
    var appIter = 0;
    while (stillPages) {
        var pageIter = pageIter + 1;
        var data = await httpsFetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + targetTenantToken
            }
        });

        // For the demo, log out the response
        console.log('Output from step 2.' + pageIter + ': ', data);

        // Pagination checks
        if (data.links.next == undefined) {
            var stillPages = false;
        } else {
            var queryUrl = data.links.next.href;
        }

        // Loop through returned apps and call delete endpoint
        for (let appKey in data.data) {
            var appIter = appIter + 1;
            var appId = data.data[appKey].resourceId;
            
            var data = await httpsFetch(targetTenantUrlFull + '/api/v1/apps/' + appId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + targetTenantToken
                }
            });

            // For the demo, log out the response
            console.log('Output from step 2.' + pageIter + '/'+ appIter + ': ', data);
        }

    }

    // 3 - Get list of spaces and delete them
    var stillPages = true;
    var queryUrl = targetTenantUrlFull + '/api/v1/spaces?limit=100';
    var pageIter = 0;
    var spaceIter = 0;
    while (stillPages) {
        var pageIter = pageIter + 1;
        var data = await httpsFetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + targetTenantToken
            }
        });
        console.log(queryUrl);
        // For the demo, log out the response
        console.log('Output from step 3.' + spaceIter + ': ', data);

        // Pagination checks
        if (data.links.next == undefined) {
            var stillPages = false;
        } else {
            var queryUrl = data.links.next.href;
        }

        // Loop through returned spaces and call delete endpoint
        for (let spaceKey in data.data) {
            var spaceIter = spaceIter + 1;
            var spaceId = data.data[spaceKey].id;
            
            var data = await httpsFetch(targetTenantUrlFull + '/api/v1/spaces/' + spaceId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + targetTenantToken
                }
            });

            // For the demo, log out the response
            console.log('Output from step 3.' + pageIter + '/'+ spaceIter + ': ', data);
        }

    }


};

// Let's deploy content
cleanTenant();