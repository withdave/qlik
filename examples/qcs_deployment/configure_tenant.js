// Bring in config file with values for the qcs const below, template is in the package
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
    groups: ['Admin', 'Finance', 'Marketing', 'Sales'],
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

async function configureTenant() {

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
    // 2 - Configure autoCreateGroups
    var data = await httpsRequest({
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
    }]));
    // For the demo, log out the response
    console.log('Output from step 2: ' + data);

    // ***************************
    // 3 - Configure automatic assignment of professional and analyzer licenses
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/licenses/settings',
        method: 'PUT',
        headers: {
            'Content-Type': 'Application/Json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    }, JSON.stringify({
        autoAssignProfessional: tenantSettings.autoAssignProfessional,
        autoAssignAnalyzer: tenantSettings.autoAssignAnalyzer
    }));
    // For the demo, log out the response
    console.log('Output from step 3: ' + JSON.stringify(data));

    // ***************************
    // 4 - Get tenant id
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/tenants',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    });
    // For the demo, log out the response
    console.log('Output from step 4: ' + JSON.stringify(data));

    // Keep a copy of the tenant id, we'll need it shortly
    const tenantId = data.data[0].id;

    // ***************************
    // 5 - Configure JWT IdP on the tenant
    // Prepare IdP configuration for the JWT IdP post with the tenant ID and config
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
    });

    // For the demo, log out the IdP config we're going to send
    console.log('Output from step 5a: ' + idpConfiguration);

    // Send request to create JWT IdP
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/identity-providers',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    }, idpConfiguration);

    // For the demo, log out the response
    console.log('Output from step 5b: ' + JSON.stringify(data));

    // ***************************
    // 6 - Send our JWT request and seed groups
    // Built our JWT with the groups we want to seed
    const seedToken = jwt.sign(jwtPayload, jwtPrivateKey, jwtSigningOptions);

    // For the demo, log out the token we're going to use to seed groups
    console.log('Output from step 6a: ' + seedToken);

    // Send the request
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/login/jwt-session',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + seedToken
        }
    });

    // For the demo, log out the response
    console.log('Output from step 6b: ' + JSON.stringify(data));

    // ***************************
    // 7 - Get groups on the tenant to give us way of verifying that they have been created
    var data = await httpsRequest({
        hostname: targetTenantUrl,
        port: 443,
        path: '/api/v1/groups',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + targetTenantToken
        }
    });

    // For the demo, log out the response
    console.log('Output from step 7: ' + JSON.stringify(data));
}

// Go (con)figure!
configureTenant();