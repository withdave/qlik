// Bring in oauth client - this config file contains values for the qcs const below
const config = require('./qct_config.json');

// This example uses just https, you may want to use a package for requests
const https = require('https')

// Required for jwt generation
const fs = require('fs');
const uid = require('uid-safe');
const jwt = require('jsonwebtoken');

// Configure for your Qlik Cloud deployment
const qcs = {
    targetTenant: 'name', // the tenant that you wish to configure, e.g. name for name.eu.qlikcloud.com
    region: config.region, // Qlik Cloud region URL e.g. name.eu.qlikcloud.com becomes eu.qlikcloud.com
    regionClientId: config.regionClientId, // our oauth client id, generated in MyQlik, e.g. '12345678912345678'
    regionClientSecret: config.regionClientSecret // our oauth client secret, generated in MyQlik, e.g. 'eac0dswfec23ewfweweg2g2vsebw77e1cce'
}

// Configure tenant settings
const tenantSettings = {
    autoCreateGroups: true,
    autoAssignProfessional: false,
    autoAssignAnalyzer: false
}

// Config for IdP
const idpSettings = {
    description: "Auth for my app or portal",
}

// JWT: Configure JWT IdP payload with the groups we want to seed
const jwtPayload = {
    jti: uid.sync(32), // 32 bytes random string
    sub: 'mydomain\\yournamehere',
    subType: 'user',
    name: 'Your Name Here',
    email: 'yournamehere@example.com',
    email_verified: true,
    groups: ['Admin', 'Finance', 'Marketing', 'Sales1'],
};

// JWT: Identify keys
const jwtPrivateKey = fs.readFileSync('./certs/nameap_privatekey.pem');
const jwtPublicKey = fs.readFileSync('./certs/nameap_publickey.cer');

// JWT: Provide signing options
// kid and issuer have to match with the IDP config and the
// audience has to be qlik.api/jwt-login-session
const jwtSigningOptions = {
    keyid: 'myapporportal',
    algorithm: 'RS256',
    issuer: 'nameeustage',
    expiresIn: '30m',
    notBefore: '0s',
    audience: 'qlik.api/login/jwt-session'
};


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

// Prepare license assignment
let licenseAssignment = JSON.stringify({
    autoAssignProfessional: tenantSettings.autoAssignProfessional,
    autoAssignAnalyzer: tenantSettings.autoAssignAnalyzer
});

// 1 - Get access token for target tenant, for use will all future requests
httpsRequest({
    hostname: targetTenantUrl,
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
    let targetTenantToken = body.access_token;

    // 2 - Configure autoCreateGroups
    httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/groups/settings',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    }, JSON.stringify([{
        op: 'replace',
        path: '/autoCreateGroups',
        value: tenantSettings.autoCreateGroups
    }])).then(function (body) {
        // Print out response for testing
        console.log(body);

        // 3 - Configure automatic assignment of professional and analyzer licenses
        httpsRequest({
            hostname: targetTenantUrl,
            port: 443,
            path: '/api/v1/licenses/settings',
            method: 'PUT',
            headers: {
                'Content-Type': 'Application/Json',
                'Authorization': 'Bearer ' + targetTenantToken
            }
        }, licenseAssignment).then(function (body) {
            // Print out response for testing
            console.log("License settings: " + JSON.stringify(body));

            // 4 - Get tenant id
            return httpsRequest({
                hostname: targetTenantUrl,
                port: 443,
                path: '/api/v1/tenants',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + targetTenantToken
                }
            }).then(function (body) {
                // Print out for testing
                console.log(body);

                // Keep a copy of the tenant id, we'll need it
                const tenantId = body.data[0].id;
                console.log('Found tenant id: ' + tenantId);

                // Prepare IdP configuration
                const idpConfiguration = JSON.stringify({
                    tenantIds: [
                        tenantId
                    ],
                    provider: "external",
                    protocol: "jwtAuth",
                    interactive: false,
                    active: true,
                    description: idpSettings.description,
                    options: {
                        jwtLoginEnabled: true,
                        issuer: jwtSigningOptions.issuer,
                        staticKeys: [
                            {
                                kid: jwtSigningOptions.keyid,
                                pem: jwtPublicKey.toString()
                            }
                        ]
                    }
                })
                console.log(idpConfiguration);


                // 5 - Configure JWT IdP on the tenant
                httpsRequest({
                    hostname: targetTenantUrl,
                    port: 443,
                    path: '/api/v1/identity-providers',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + targetTenantToken
                    }
                }, idpConfiguration).then(function (body) {
                    // Print out response for testing
                    console.log("Another: " + JSON.stringify(body));

                    // Built token for next request
                    const seedToken = jwt.sign(jwtPayload, jwtPrivateKey, jwtSigningOptions);

                    // 6 - Send our JWT request and seed groups
                    httpsRequest({
                        hostname: targetTenantUrl,
                        port: 443,
                        path: '/login/jwt-session',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + seedToken
                        }
                    }).then(function (body) {
                        // Print out response for testing
                        console.log("Login: " + body);

                        // 7 - Get groups on the tenant to verify they have been created
                        httpsRequest({
                            hostname: targetTenantUrl,
                            port: 443,
                            path: '/api/v1/groups',
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + targetTenantToken
                            }
                        }).then(function (body) {
                            // Print out response for testing
                            console.log("Login: " + JSON.stringify(body));

                            // Optional - remove dummy user and remove seeding JWT IdP
                        })
                    })
                })
            })
        })
    })
});
