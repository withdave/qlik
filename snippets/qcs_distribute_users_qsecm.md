# Distributing users from QSECM to QSE SaaS using Qlik CLI

This example demonstrates a method to recreate users from a QSECM environment in QSE SaaS. This is a prerequisite to allowing pre-allocation of users to spaces, roles and licenses prior to their first login to the platform.

## Prerequisites

The following should be completed prior to running this script:
* Ensure that the user is configured with the same subject between QSECM and QSE SaaS (e.g. both the DOMAIN\USERID on CM matches the SUB on SaaS)
* Install and configure Qlik-CLI (guide here: https://qlik.dev/tutorials/get-started-with-qlik-cli)
* Add a context to connect to your QSECM environment (guide here: https://qlik.dev/tutorials/using-qlik-sense-on-windows-repository-api-qrs-with-qlik-cli)
* Add a context to connect to your QSE SaaS environment (guide here: https://qlik.dev/tutorials/get-started-with-qlik-cli)
* Identify a discriminator in case you wish to reduce the number of users pushed by the script below to SaaS (script will need to be modified)

## Process

The script roughly follows this process:
1. Load user list from QSECM into an object
2. Prepare relevant fields from the user list (optionally filter)
3. Loop over the list and push these to QSE SaaS
4. Capture results from each request and store logs to disk

## Script

```

```
