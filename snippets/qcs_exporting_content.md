# Exporting content from QCS

Qlik Sense Enterprise SaaS allows export of applications from personal and shared spaces, but other content is more difficult to extract from the platform. This page summarises available options for exporting content from QCS.

Note that QCS has a constant release cycle, meaning the information below become out of date at any time.

## Content Types

### Applications (private/ shared spaces)

When the user has the correct permissions for the space, go to the hub, click the ellipsis (three dots) on an app and then "Export with data" or "Export without data" to download the app with the data in the data model, or without the data in the data model.

Tenant or analytics admins will be able to export apps from any private/ shared space.

### Applications (managed spaces)

It is not possible to export applications in managed spaces via the hub or management console.

The alternatives are:
* Export a copy of the app from a shared space (if it exists), or from the QSEoW platform that's distributing the app to that managed space (if distributed)
* Duplicate sheets in the app and copy them into a new app (if the user has at least contribute permissions on the space, and the data model exists elsewhere) - this will not return the data model
* Use the APIs to return the application definition and rebuild the app in a private or shared space

#### Unbuild and build of apps in managed spaces

Note: if the app has been distributed from a QSEoW environment, the copy on QCS will not contain a load script. Apps published from a QCS private or shared space will contain a load script and be recoverable.

The unbuild command will create flat-file definitions of the application for all approved (i.e. base) and published (i.e. community) sheets and stories, along with the associated objects.

To generate the unbuild app:

```
qlik app unbuild --app '{appId}' --dir "{localPathForUnbuildFiles}"
```

This can then be rebuilt into a new application in a private space.

First, we need to create a shell app to add all of this content to. This creates a blank app in your personal space:

```
qlik app create --attributes-name "Rebuilt app" --attributes-description "Rebuilt via build command"

```
You can optionally specify "--attributes-spaceId" to set the target shared space.

```
qlik app build --app "Rebuilt app" --app-properties "app-properties.json" --dimensions "dimensions.json" --measures "measures.json" --objects "objects\*" --script "script.qvs" --variables "variables.json" --no-reload```
```

Note that we do not re-import the connections.yml file as we only want the app and not the data connections recreated. We also cannot rebuild bookmarks as these aren't currently created during unbuild. Once rebuilt, base and community sheets will need to be made public again.

Some additional examples of using these commands can be found here: https://qlik.dev/tutorials/migrate-apps-from-qlik-sense-on-windows-to-qlik-sense-saas

### Data (private/ shared/ managed spaces)

Data from any space can be loaded into apps and stored (via load script) into a cloud accessible data store such as AWS S3, where it can then be exported. It is not generally possible to export data via the GUI or APIs from Qlik SaaS.

### Extensions

Extensions can't be downloaded from the management console, but they can be returned via APIs.

First get the extension ID. One method to do this is to return all extensions via the APIs:
```
GET /api/v1/extensions
```

Now request the file for the extension you wish to export, and it will provide the zip file for the extension in the response:
```
GET /api/v1/extensions/{extensionId}/file
```
The response will need to be saved to a file with the .zip format to open normally on Windows machines.

Reference: https://qlik.dev/apis/rest/extensions

### Themes

Themes can't be downloaded from the management console, but they can be returned via APIs.

First get the theme ID. One method to do this is to return all themes via the APIs:

```
GET /api/v1/themes
```

Now request the file for the theme you wish to export, and it will provide the zip file for the theme in the response:

```
GET /api/v1/themes/{themeId}/file
```

The response will need to be saved to a file with the .zip format to open normally on Windows machines.

Reference: https://qlik.dev/apis/rest/themes
