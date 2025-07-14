# Create QVDs from a QVF

This snippet creates QVDs from the tables in a QVF. AKA Store all tables to QVD/ file.

Into another QVF, enter and run this script.

```
binary [66230f99-6da0-4d7f-9558-67b738c36e48];

for i = 0 to nooftables() - 1

	let vTableName = tablename(i);
	trace Attempting to store table [$(vTableName)].;
	store [$(vTableName)] into [lib://connectionName/$(vTableName).qvd] (qvd);

next;
```

Unless a temporary table is used, don't drop table during this loop as you'll break the counter. You can clean them upafterwards with:

```
for i = 0 to nooftables() - 1

	let vTableName = tablename(i);
	trace Dropping table [$(vTableName)].;
	drop table [$(vTableName)];

next;
```
