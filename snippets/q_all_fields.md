# Load all fields in a data model

Script loads all fields in a data model into a single field. Useful for custom pivot sheets.

```
// Let's keep things tidy in the UI
Set HidePrefix = '%';

// Load a table of field names
// First iter over all tables
FOR iter_tables=0 to NoOfTables() - 1

	// Next iter over all fields in this table
	FOR iter_fields=1 to NoOfFields(TableName($(iter_tables)))

	Island_Fields:
	LOAD
		TableName($(iter_tables)) 				AS %TableName,
		FieldName($(iter_fields),TableName($(iter_tables)))	AS %FieldName
	AutoGenerate 1;

	NEXT iter_fields;
NEXT iter_tables;
```

## To then reference specific fields in a pivot table

This can be used on the show column property of a pivot table.

```
SubStringCount('|' & Concat(distinct %FieldName, '|') & '|', '|Expression1|') 
```
