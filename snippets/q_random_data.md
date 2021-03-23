# Generate some random data

```
// Generate some random data
// This is roughly based off of the Qlik Ctrl+O+O default script, but with a bit more variety
SET vRecordCount = 50000;

Transactions:
Load
	IterNo()                              as TransLineID,
	RecNo()                               as TransID,
	mod(RecNo(),26)+1                     as Number,
	chr(Floor(26*Rand())+65)              as Dimension1,
	chr(Floor(26*Rand())+97)              as Dimension2,
	chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
	   &chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
	   &chr(Floor(26*Rand())+pick(round(rand())+1,65,97))
	   &chr(Floor(26*Rand())+pick(round(rand())+1,65,97)) as Dimension3,
	Hash128(Rand())                       as Dimension4,
	round(1000000*Rand(),0.01)            as Expression1,
	Round(1000*Rand()*Rand())             as Expression2,
	Round(Rand()*Rand()*Rand(),0.00001)   as Expression3
Autogenerate $(vRecordCount);

// Add comments to describe each field
Comment Field Dimension1 With "Random upper-case letter";
Comment Field Dimension2 With "Random lower-case letter";
Comment Field Dimension3 With "Random four letter string";
Comment Field Dimension4 With "Random string (hash128)";
Comment Field Expression1 With "Random value between 0 and 1000000 (2dp)";
Comment Field Expression2 With "Random value between 0 and 1000 (0dp)";
Comment Field Expression3 With "Random value between 0 and 1 (5dp)";
```
