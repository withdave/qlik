# Session app QVD round trip

Demonstrates a session-app round trip against a Qlik Cloud tenant using
[`@qlik/api`](https://github.com/qlik-oss/qlik-api-ts) with OAuth M2M auth:

1. `01_create_qvd.js` opens a session app, autogenerates 10,000 rows (ID, Name,
   Value), and `STORE`s them to `lib://DataFiles/session_app_demo.qvd`.
2. `02_stream_qvd.js` opens a second session app, loads `* FROM` that QVD,
   discovers the fields dynamically, creates a dimension-only session object
   over them, and streams the rows to stdout as NDJSON - paginated 1000 rows
   at a time via `getHyperCubeData`, so a 10k-row QVD exercises 10 pages.

## Setup

```sh
npm install
cp .env.example .env
```

Fill in `.env` with your tenant host and a **machine-to-machine** OAuth client
(Management Console > Identity & access > OAuth clients, client type
"Machine to machine"). M2M clients run as tenant admin - use a test/dev tenant.

## Run

```sh
node 01_create_qvd.js
node 02_stream_qvd.js
```

Or pipe the second script's output somewhere:

```sh
node 02_stream_qvd.js > out.ndjson
```

## Note on the QVD path

Both scripts target `lib://DataFiles`, the calling user's personal-space
default data-files connection. If your tenant/session-app doesn't resolve that
connection (engine error along the lines of "connection not found"), replace
`QVD_PATH` in both scripts with the `lib://<connection-name>` of an explicit
data connection instead - you can look one up via `@qlik/api`'s
`dataConnections` REST module.
