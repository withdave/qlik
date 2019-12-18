# Enumerations for Qlik Sense QRS API values

```
// Task status enums
Map_TaskStatus:
MAPPING LOAD
	*
INLINE [
Key, Value
0, 0 - Never started
1, 1 - Triggered
2, 2 - Started
3, 3 - Queued
4, 4 - Abort initiated
5, 5 - Aborting
6, 6 - Aborted
7, 7 - Successful
8, 8 - Failed
9, 9 - Skipped
10, 10 - Retrying
11, 11 - Error
12, 12 - Reset
];


// Audit Activity Log Verbosity
Map_AuditActivityLog:
MAPPING LOAD
	*
INLINE [
Key, Value
0, 0 - Off
1, 1 - Fatal
2, 2 - Error
3, 3 - Warning
4, 4 - Basic
5, 5 - Extended
];

```
