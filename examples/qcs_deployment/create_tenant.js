// Bring in config file with values for the qcs const below, template is in the package
const config = require('./qct_config.json');

// Configure for your Qlik Cloud deployment
const qcs = {
    licenseNumber: config.licenseNumber, // the license key for the organization, as shown in MyQlik or your welcome email, e.g. 0990654599117705
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

async function createTenant() {

    // ***************************
    // 1 - Get access token for the regional register tenant, which we need to request a new tenant
    var data = await httpsRequest({
        hostname: 'register.' + qcs.region,
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
    let registerTenantToken = data.access_token;

    // ***************************
    // 2 - Request new tenant in region
    var data = await httpsRequest({
        hostname: 'register.' + qcs.region,
        port: 443,
        path: '/api/v1/tenants',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + registerTenantToken
        }
    }, JSON.stringify({
        license: {
            key: qcs.licenseKey,
            number: qcs.licenseNumber
        }
    }));

    // For the demo, log out the response
    console.log('Output from step 2: ' + JSON.stringify(data));
    
    // Save new tenant URL for next request
    let targetTenantUrl = data.hostnames[0];
    console.log('Output from step 2: ' + targetTenantUrl);

    // ***************************
    // 3 - Get access token for new tenant
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
    console.log('Output from step 3: ' + JSON.stringify(data));

    // Save target tenant access token for next request
    let targetTenantToken = data.access_token;


    // ***************************
    // 4 - Send a request to the new tenant (proof of life)
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/users/me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    });

    // For the demo, log out the response
    console.log('Output from step 4: ' + JSON.stringify(data));

};

// Go create!
createTenant();