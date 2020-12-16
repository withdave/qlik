# QCS Reload Trigger

In QCS, task chaining doesn't currently exist. Instead, you need to utilise the APIs to trigger tasks.

This snippet is intended for use at the end of your load scripts. You can reference the subroutine in an include file, then call it at the end of the script. It'll trigger the listed app, then write a log file to record the action. If the input parameters aren't correct then the reload of the containing app will fail.

```
Sub sTriggerReload(sub_appID,sub_connAPI,sub_connLog)

	/* 
    
    This subroutine triggers the reload of a QCS application (directly, not using scheduled tasks)
    
    INPUTS:
    * sub_appID = the GUID for the app to be reloaded
    * sub_connAPI = a REST data connection that can access the tenant APIs with appropriate privileges
    * sub_connLog = a folder data connection for storing reload trigger log files (these will be stored as "ReloadLog_<AppID>_<ReloadID>.qvd")
    
    OUTPUTS:
    * Send a POST message the task API to trigger the relevant app reload
    * Store a log file to record the reload trigger to assist with finding this event in audit logs if needed
    
    */
    
    // Connect to the REST connection
    LIB CONNECT TO '$(sub_connAPI)';
    
    LET sub_QueryBody = '{""appId"":""$(sub_appID)""}';

    // Collect data from the response for logging
    // Configure app ID for reload
    RestConnectorMasterTable:
    SQL SELECT 
        "id",
        "appId",
        "tenantId",
        "userId",
        "type",
        "status",
        "creationTime",
        "__KEY_root"
    FROM JSON (wrap on) "root" PK "__KEY_root"
    WITH CONNECTION (BODY "$(sub_QueryBody)");

    ReloadLog:
    LOAD DISTINCT	
    	[id] 			AS [Reload ID],
        [appId] 		AS [Reload App ID],
        [tenantId] 		AS [Reload Tenant ID],
        [userId] 		AS [Reload User ID],
        [type] 			AS [Reload Type],
        [status] 		AS [Reload Status],
        [creationTime] 		AS [Reload Creation Time],
        DocumentName()		AS [Reload Trigger App ID],
        DocumentTitle()		AS [Reload Trigger App Name]
    RESIDENT RestConnectorMasterTable
    WHERE NOT IsNull([__KEY_root]);
    
    // Set variables to produce log filenames
    LET sub_ReloadTime 	= Timestamp(Peek('Reload Creation Time',0),'YYYYMMDDhhmmss');
    LET sub_ReloadID 	= Peek('Reload ID',0);
    
    // Check to see if the reload request returned rows, and the variables carry data. If not, fail this reload
    If (NoOfRows('ReloadLog') <> 1) OR ('$(sub_ReloadTime)' = '') OR ('$(sub_ReloadID)' = '') THEN
    	// Fail with an error for the log
        Call Error('An unexpected number of rows was returned by the reloads API');
    END IF;
    
    TRACE >>> Returned reload $(sub_ReloadID) at $(sub_ReloadTime);
    
    // Store logs and clear model
    STORE ReloadLog INTO [lib://$(sub_connLog)/ReloadLog_$(sub_appID)_$(sub_ReloadID)_$(sub_ReloadTime).qvd] (qvd);
    DROP TABLE ReloadLog;
	DROP TABLE RestConnectorMasterTable;
    
End Sub;

// Call - pass in the app ID, the REST connection name, the folder connection name
Call sTriggerReload('ab77b40d-4a30-46d9-9d2b-2943c6b82902','<rest connection name>','DataFiles');
```
