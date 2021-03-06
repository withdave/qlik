
# Load a source file with changing field names and crosstable
For use where the data has columns named after dates, and the dates change each week. Likely to be a cleaner way of doing this!

Data Example - Qlik Inline
```
LOAD * INLINE [
    F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15, F16
    Resource Name, Project Name, Assignment Bill Rate (USD), 29/03/2020, 05/04/2020, 12/04/2020, 19/04/2020, 26/04/2020, 03/05/2020, 10/05/2020, 17/05/2020, 24/05/2020, 31/05/2020, 07/06/2020, 14/06/2020, 21/06/2020
    Person A, Project 1, 100.00, -, -, -, -, -, -, -, 500.00, -, -, -, -, -
    Person B, Project 2, 100.00, 400.00, 0.00, 0.00, 0.00, 500.00, -, -, -, -, -, -, -, -
    Person C, Project 3, 100.00, -, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, -, 650.00, -
    Person A, Project 4, 100.00, -, -, -, -, 900.00, -, -, -, -, -, -, -, -
    Person B, Project 5, 100.00, 350.00, -, -, -, -, -, 750.00, -, -, -, -, -, -
];
```

Data Example - Tabular
| Resource Name | Project Name | Assignment Bill Rate (USD) | 29/03/2020 | 05/04/2020 | 12/04/2020 | 19/04/2020 | 26/04/2020 | 03/05/2020 | 10/05/2020 | 17/05/2020 | 24/05/2020 | 31/05/2020 | 07/06/2020 | 14/06/2020 | 21/06/2020 |
|---------------|--------------|----------------------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|
| Person A      | Project 1    | 100.00                     | -          | -          | -          | -          | -          | -          | -          | 500.00     | -          | -          | -          | -          | -          |
| Person B      | Project 2    | 100.00                     | 400.00     | 0.00       | 0.00       | 0.00       | 500.00     | -          | -          | -          | -          | -          | -          | -          | -          |
| Person C      | Project 3    | 100.00                     | -          | 0.00       | 0.00       | 0.00       | 0.00       | 0.00       | 0.00       | 0.00       | 0.00       | 0.00       | -          | 650.00     | -          |
| Person A      | Project 4    | 100.00                     | -          | -          | -          | -          | 900.00     | -          | -          | -          | -          | -          | -          | -          | -          |
| Person B      | Project 5    | 100.00                     | 350.00     | -          | -          | -          | -          | -          | 750.00     | -          | -          | -          | -          | -          | -          |


Qlik load script
```
// Load the table definition
// Can be specified as A/B/C or with *
Table_Definition:
FIRST 1
LOAD
    *
FROM [lib://DLs/TLExport.xlsx]
(ooxml, no labels, table is Sheet1);

// Load and print field counts
LET vDefinition_Count = NoOfFields('Table_Definition');
TRACE >> Found $(vDefinition_Count) fields.;

// Create an empty field definition
SET vDefinition_Fields = '';

// Iterate over the table to build the field definition
FOR vIter = 1 TO vDefinition_Count

	LET vLoop_FieldValue = Peek(FieldName(vIter,'Table_Definition'),0,'Table_Definition');
    LET vLoop_FieldValue = IF(IsNum('$(vLoop_FieldValue)'),NUM('$(vLoop_FieldValue)','00000'),'$(vLoop_FieldValue)');
	LET vDefinition_Fields = '$(vDefinition_Fields)' & chr(91) & '$(vLoop_FieldValue)' & chr(93) & ',';

Next vIter;

// Clean the trailing ',', drop source table and trace out
LET vDefinition_Fields = LEFT('$(vDefinition_Fields)',LEN('$(vDefinition_Fields)')-1);
TRACE >> $(vDefinition_Fields);
DROP TABLE Table_Definition;


// Now load the new table with our custom definition
MyData:
CrossTable('Date','Revenue',3)
LOAD
    $(vDefinition_Fields)
FROM [lib://DLs/TLExport.xlsx]
(ooxml, embedded labels, table is Sheet1);
```
