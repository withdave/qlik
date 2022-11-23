// Bring in config file with values for the qcs const below, template is in the package
const config = require('./qct_config.json');

// Configure for your Qlik Cloud deployment
const qcs = {
    licenseKey: config.licenseKey, // the license key for the organisation, e.g. eyJhbGciOiJFZERTQSIsImtp....
    region: config.region, // Qlik Cloud region URL e.g. name.eu.qlikcloud.com becomes eu.qlikcloud.com
    regionClientId: config.regionClientId, // our oauth client id, generated in MyQlik, e.g. '12345678912345678'
    regionClientSecret: config.regionClientSecret // our oauth client secret, generated in MyQlik, e.g. 'eac0dswfec23ewfweweg2g2vsebw77e1cce'
}

// This example uses just https, you may want to use a package
const https = require('https')

// Prepare our oauth cred package for future auth requests
const oauthClientData = JSON.stringify({
    client_id: qcs.regionClientId,
    client_secret: qcs.regionClientSecret,
    grant_type: "client_credentials"
})

// Function to handle our requests
async function httpsFetch(url, settings) {
    try {
        const fetchResponse = await fetch(url, settings);
        const data = await fetchResponse.json();
        return data;

    } catch (e) {
        return e;
    }
}

// Get an access token for a specified hostname and oauth client
async function getAccessToken(hostname) {

    var data = await httpsFetch('https://' + hostname + '/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: oauthClientData
    });

    return data;

}

async function createTenant() {

    // ***************************
    // 1 - Get access token for the regional register tenant, which we need to request a new tenant
    var data = await getAccessToken('register.' + qcs.region);

    // For the demo, log out the response
    console.log('Output from step 1: ' + JSON.stringify(data));
    // Save access token for next request
    let registerTenantToken = data.access_token;

    // ***************************
    // 2 - Request new tenant in region
    var data = await httpsFetch('https://register.' + qcs.region + '/api/v1/tenants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + registerTenantToken
        },
        body: JSON.stringify({
            licenseKey: qcs.licenseKey
        })
    });

    // For the demo, log out the response
    console.log('Output from step 2: ' + JSON.stringify(data));
    
    // Save new tenant URL for next request
    let targetTenantUrl = data.hostnames[0];
    console.log('Hostname from step 2: ' + targetTenantUrl);

    // ***************************
    // 3 - Get access token for new tenant
    var data = await getAccessToken(targetTenantUrl);

    // For the demo, log out the response
    console.log('Output from step 3: ' + JSON.stringify(data));

    // Save target tenant access token for next request
    let targetTenantToken = data.access_token;


    // ***************************
    // 4 - Send a request to the new tenant (proof of life)
    var data = await httpsFetch('https://' + targetTenantUrl + '/api/v1/users/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    });

    // For the demo, log out the response
    console.log('Output from step 4: ' + JSON.stringify(data));

};

// Create 1 tenant
createTenant();

// // Go create 5 tenants
// for (let i = 0; i < 5; i++) {
//     createTenant();
//   }