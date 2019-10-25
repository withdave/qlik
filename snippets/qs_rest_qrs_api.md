# Creating a server-bound connection to the QRS API

These are effectively a copy of the existing REST monitoring app connections.

## Example of QRS App endpoint

This is the default config for the app endpoint (before FQDN change).

``` 
CUSTOM CONNECT TO "provider=QvRestConnector.exe;url=https://localhost/win/qrs/app/full;timeout=900;method=GET;autoDetectResponseType=true;keyGenerationStrategy=0;authSchema=ntlm;skipServerCertificateValidation=true;useCertificate=No;certificateStoreLocation=LocalMachine;certificateStoreName=My;trustedLocations=qrs-proxy%2https://localhost:4244;queryParameters=xrfkey%20000000000000000;addMissingQueryParametersToFinalRequest=false;queryHeaders=X-Qlik-XrfKey%20000000000000000%1User-Agent%2Windows;PaginationType=None;"
```

## Configuring via the Hub

| Property | Value 1 | Value 2 | Notes |
| -------- | ------- | ------- | ----- |
| URL  | https://localhost/qrs/app/full | | Swap out localhost for the FQDN of the CN |
| Timeout | 60 | | The default is 900s, but this feels too high |
| Authentication | Windows NTLM | | Ideal on Windows |
| Username / Password | service account credentials | | |
| Trusted locations | qrs-proxy | https://localhost:4244 | Swap out for FQDN |
| Query parameters | xrfkey | 0000000000000000 | Use a random 16 character alphanumeric string to match header below |
| Query headers | X-Qlik-XrfKey | 0000000000000000 | As above |
| Query headers | User-Agent | Windows | |
| Allow HTTPS only | True | | May as well build in this check, as it'll still accept self signed certs |

## Alternative option

If validation fails / creds not available / etc, use an internet facing endpoint which doesn't require authentication to create the connection, then paste the new string and credentials into the QMC.

URL: https://httpbin.org/get
