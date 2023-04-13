# Create QVDs from a QVF

This snippet creates QVDs from the tables in a QVF.

Into another QVF, enter and run this script.

```
binary [66230f99-6da0-4d7f-9558-67b738c36e48];

for i = 0 to nooftables() - 1

	let vTableName = tablename(i);
    store [$(vTableName)] into [lib://Amazon_S3_V2/$(vTableName).qvd] (qvd);
	drop  table [$(vTableName)]; 

next;
```