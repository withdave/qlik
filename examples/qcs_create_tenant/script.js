// Bring in oauth client - this config file contains values for the qcs const below
const config = require('./qct_config.json');

// Configure for your Qlik Cloud deployment
const qcs = {
    licenseNumber: config.licenseNumber, // the license key for the organization, as shown in MyQlik or your welcome email, e.g. 0990654599117705
    licenseKey: config.licenseKey, // the license key for the organisation, e.g. eyJhbGciOiJFZERTQSIsImtp....
    sourceTenant: config.sourceTenant, // a pre-existing tenant within the org, to look up the license key (just the hostname, e.g. name.eu.qlikcloud.com becomes name)
    region: config.region, // Qlik Cloud region URL (e.g. name.eu.qlikcloud.com becomes eu.qlikcloud.com)
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
            
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('Response type ' + res.statusCode));
            }
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
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

/* Put on ice - clarify subject issue with license overview
// 1 - Get access token for source tenant
httpsRequest({
    hostname: qcs.sourceTenant + '.' + qcs.region,
    port: 443,
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  },oauthClientData).then(function(body) {
    // Print out access token for testing
    console.log(body);
    const sourceTenantToken = body.access_token;
    
    // 2 - Get our license key from source tenant
    return httpsRequest({
        hostname: qcs.sourceTenant + '.' + qcs.region,
        port: 443,
        path: 'api/v1/licenses/status',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sourceTenantToken
        }
      });
}).then(function(body) {
    console.log(body);
});
*/

// 3 - Get access token for register tenant
httpsRequest({
    hostname: 'register.' + qcs.region,
    port: 443,
    path: '/oauth/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, oauthClientData).then(function (body) {
    // Print out access token for testing
    console.log(body);
    // Save access token for next request
    let registerTenantToken = body.access_token;

    // 4 - Request new tenant in region
    return httpsRequest({
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
    })).then(function (body) {
        // Print out new tenant properties for testing
        console.log(body);
        console.log('Built tenant ' + body.name + ' in region ' + body.datacenter + ' (id ' + body.id + ')');

        // Pick up the new tenant hostname
        let targetTenant = body.name;

        // 5 - Get access token for new tenant
        return httpsRequest({
            hostname: targetTenant + '.' + qcs.region,
            port: 443,
            path: '/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, oauthClientData).then(function (body) {
            // Print out for testing
            console.log(body);
            // Save access token for next request
            let targetTenantToken = body.access_token;

            // 6 - Request information about the user (validation step)
            return httpsRequest({
                hostname: targetTenant + '.' + qcs.region,
                port: 443,
                path: '/api/v1/users/me',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + targetTenantToken
                }
            }).then(function (body) {
                // Print out new user properties for testing
                console.log(body);
            })
        })
    })
});
