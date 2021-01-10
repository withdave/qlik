# Group By Performance

This script explores whether it's faster to aggregate data using a straight group by, or if there's a benefit to sorting the data first.

Tests:
* Order by, group by (two resident loads)
* Group by (one resident load)

## Script
```
///$tab sLog
Log:
Load
	null()	AS TestName
AutoGenerate 0;

Sub sLog(vTest,vStart,vFinish)

	TRACE >> Log [$(vTest)] started $(vStart) finished $(vFinish).;

	Concatenate(Log)
    LOAD
    	'$(vTest)'	AS TestName,
        '$(vStart)'	AS TestStart,
        '$(vFinish)'AS TestFinish
    AutoGenerate 1;

END SUB;


///$tab Load Sample Data
// Load data from QVD
Source:
LOAD
//     TransLineID,
//     TransID,
    Number,
    Dimension1,
//     Dimension2,
    Dimension3,
//     Dimension4,
    Expression1
//     Expression2,
//     Expression3
FROM [lib://dir_root_azurefiles/me/RandomData.qvd]
(qvd);

// Set number of iterations to run
SET vIter = 5;

///$tab Order by, Group by
For i=0 to vIter

    // Group by letter on a sum
    LET vTestStart = timestamp(now(),'hh:mm:ss');

    // Load order by
    OrderBy:
    LOAD
    	Dimension1,
        Expression1
    RESIDENT Source
    ORDER BY 
    	Dimension1;
    
    GroupBy:
    LOAD
        Dimension1,
        SUM(Expression1)	AS Exp1
    RESIDENT OrderBy
    GROUP BY
        Dimension1;

    DROP Table OrderBy, GroupBy;

    Call sLog('Dimension1 - O&G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));
    
    // Group by a large dimension
    LET vTestStart = timestamp(now(),'hh:mm:ss');

	// Load order by
    OrderBy:
    LOAD
    	Dimension1,
        Expression1
    RESIDENT Source
    ORDER BY 
    	Dimension1;

    GroupBy:
    LOAD
        Dimension1,
        SUM(Expression1)	AS Exp1
    RESIDENT OrderBy
    GROUP BY
        Dimension1;

    DROP Table OrderBy, GroupBy;

    Call sLog('Dimension3 - O&G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));
    
    // Group by number on a sum
    LET vTestStart_1 = timestamp(now(),'hh:mm:ss');

	// Load order by
    OrderBy:
    LOAD
    	Number,
        Expression1
    RESIDENT Source
    ORDER BY 
    	Number;

    GroupBy:
    LOAD
        Number,
        SUM(Expression1)	AS Exp1
    RESIDENT OrderBy
    GROUP BY
        Number;

    DROP Table OrderBy, GroupBy;

    Call sLog('Number - O&G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));


Next i;


///$tab Group by
For i=0 to vIter

    // Group by letter on a sum
    LET vTestStart = timestamp(now(),'hh:mm:ss');

    Temp_1:
    LOAD
        Dimension1,
        SUM(Expression1)	AS Exp1
    RESIDENT Source
    GROUP BY
        Dimension1;

    DROP Table Temp_1;

    Call sLog('Dimension1 - G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));
    
    // Group by a large dimension
    LET vTestStart = timestamp(now(),'hh:mm:ss');

    Temp_1:
    LOAD
        Dimension3,
        SUM(Expression1)	AS Exp1
    RESIDENT Source
    GROUP BY
        Dimension3;

    DROP Table Temp_1;

    Call sLog('Dimension3 - G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));
    
    // Group by number on a sum
    LET vTestStart_1 = timestamp(now(),'hh:mm:ss');

    Temp_1:
    LOAD
        Number,
        SUM(Expression1)	AS Exp1
    RESIDENT Source
    GROUP BY
        Number;

    DROP Table Temp_1;

    Call sLog('Number - G','$(vTestStart)',timestamp(now(),'hh:mm:ss'));


Next i;


///$tab Generate Data
// This is here just for reference
exit script;
// Generate some random data
// This is roughly based off of the Qlik Ctrl+O+O default script, but with a bit more variety
SET vRecordCount = 5000000;

Transactions:
Load
	IterNo()								as TransLineID,
	RecNo()									as TransID,
	mod(RecNo(),26)+1						as Number,
	chr(Floor(26*Rand())+65)				as Dimension1,
	chr(Floor(26*Rand())+97)				as Dimension2,
	chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
 		&chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
    	&chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
        &chr(Floor(26*Rand())+pick(round(rand())+1,65,97)) as Dimension3,
// 	Hash128(Rand())							as Dimension4,
	round(1000000*Rand(),0.01)				as Expression1,
	Round(1000*Rand()*Rand())				as Expression2,
	Round(Rand()*Rand()*Rand(),0.00001)		as Expression3
Autogenerate $(vRecordCount);

// Add comments to the dimension fields
Comment Field Dimension1 With "Random upper-case letter";
Comment Field Dimension2 With "Random lower-case letter";
Comment Field Dimension3 With "Random four letter string";
Comment Field Dimension4 With "Random string (hash128)";
Comment Field Expression1 With "Random value between 0 and 1000000 (2dp)";
Comment Field Expression2 With "Random value between 0 and 1000 (0dp)";
Comment Field Expression3 With "Random value between 0 and 1 (5dp)";

STORE Transactions INTO [lib://dir_root_qlikdatastore/me/RandomData.qvd] (qvd);
DROP TABLE Transactions;

```
