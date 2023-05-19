// This will generate a JWT for a client-managed deployment

// Required for jwt generation
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Creating a Qlik Sense on Windows payload.
const jwtPayload = {
    userid: 'jwtuser',
    userdirectory: 'jwt',
    name: 'JWT User',
    email: 'jwt@example',
    groups: ['Adminstrators'],
  };

// JWT: Private key (pem file)
const jwtPrivateKey = fs.readFileSync('./certs/qs-dev jwt/privatekey.pem');

// JWT: Provide signing options
const jwtSigningOptions = {
    algorithm: 'RS256',
    expiresIn: '365d',
    audience: 'jwt',
  };

// Create the token
const token = jwt.sign(jwtPayload, jwtPrivateKey, jwtSigningOptions);

console.log('Generated JWT:', token);
