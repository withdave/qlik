# Purpose

TBC

# Notes

* Each load performs a full load of the archived log files - this could be optimised to take the latest modified log file, or strip the file name

# Backlog

* Verify session data
* Add licence allocation

# Script

```

// Extract user accounts and admin roles

// Connect to user full endpoint (should match /qrs/user/full)
LIB CONNECT TO 'monitor_apps_REST_user';

// Load temp table
RestConnectorMasterTable:
SQL SELECT 
	"id" 				AS "User GUID",
	"userId"			AS "User ID",
	"userDirectory"		AS "User Directory",
	"name" 				AS "User Name",
	"inactive"			AS "User Inactive",
	"removedExternally"	AS "User Removed Externally",
	"blacklisted"		AS "User Blacklisted",
	"deleteProhibited"	AS "User Delete Prohibited",
	"__KEY_root",
	(SELECT 
		"@Value" AS "User Role",
		"__FK_roles"
	FROM "roles" FK "__FK_roles" ArrayValueAlias "User Role")
FROM JSON (wrap on) "root" PK "__KEY_root";

// Load all role assignments
Dim_Roles:
LOAD	
	[User Role],
	[__FK_roles] AS %Key_User
RESIDENT RestConnectorMasterTable
WHERE NOT IsNull([__FK_roles]);

// Load current user list
Dim_User:
LOAD	
	[User GUID],
    [User ID],
    [User Directory],
    [User Directory] & '\' & [User ID]		AS %Key_UserAccount,
    [User Name],
	[User Inactive],
	[User Removed Externally],
	[User Blacklisted],
	[User Delete Prohibited],
	[__KEY_root]							AS %Key_User	
RESIDENT RestConnectorMasterTable
WHERE NOT IsNull([__KEY_root]);

// Drop the temp table
DROP TABLE RestConnectorMasterTable;


```