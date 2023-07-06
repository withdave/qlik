/*
To do:
- Handle start date correctly
- Wrap end date to last day
*/

function generateDateArray(timestamp) {
    var currentDate = new Date();
    var currentDate = currentDate.setDate(currentDate.getDate() - 2);
    const startDate = new Date(timestamp);
    var iterDate = new Date(timestamp);
    const datesArray = [];
  
    // Set the start date's time to match the provided timestamp
    startDate.setHours(new Date(timestamp).getHours());
    startDate.setMinutes(new Date(timestamp).getMinutes());
    startDate.setSeconds(new Date(timestamp).getSeconds());
    startDate.setMilliseconds(new Date(timestamp).getMilliseconds());
  
    iterDate = new Date(JSON.parse(JSON.stringify(startDate)));        
    iterDate.setHours(24,59,59,999);
    datesArray.push((new Date(startDate)).toISOString() + '/' + (new Date(iterDate)).toISOString());
    

    while (startDate < currentDate) {
        //console.log(startDate + currentDate)
        startDate.setDate(startDate.getDate() + 1);
        //startDate.setHours(1);
        startDate.setHours(1,0,0,0);
        
        
        iterDate = new Date(JSON.parse(JSON.stringify(startDate)));        
        iterDate.setHours(24,59,59,999);

        datesArray.push((new Date(startDate)).toISOString() + '/' + (new Date(iterDate)).toISOString());
    }
  
    // Add the current timestamp
    var today = new Date();
    var today = today.setHours(1,0,0,0);
    datesArray.push((new Date(today)).toISOString() + '/' + (new Date()).toISOString());
  
    return datesArray;
  }
  
  // Example usage
  const inputTimestamp = 1684262549000; 
  const dateArray = generateDateArray(inputTimestamp);
  
  console.log(dateArray);