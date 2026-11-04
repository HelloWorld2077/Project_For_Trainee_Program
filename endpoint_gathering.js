const scom = require('/home/nikolas/Documents/Project_for_Trainee/server_commands')
const eq = require('/home/nikolas/Documents/Project_for_Trainee/equation')
const gt = require('/home/nikolas/Documents/Project_for_Trainee/general_tools')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const json_to_display = []

function parseSemicolonData(rawText) {
  const rows = rawText.split(/\r?\n/);

  return rows.map((row) => {
    // Save an untouched copy of the line
    const originalLineCopy = row.trim();
    
    if (originalLineCopy === '' || originalLineCopy.includes('idMonitorado')) {
      return null;
    }

    // 1. Perform a quick split on the row just to isolate the isActive status
    const tempColumns = originalLineCopy.split(';').map(val => val.trim());
    
    // In a line containing true/false, find its value position (usually index 5)
    // We check if any of the columns include 'true' or match 'true'
    const isRowActive = tempColumns.some(col => col === 'true');

    let extractedAggressorId = null;

    if (!isRowActive) {
      // If false, proceed with normal, untouched column splitting logic
      // No aggressorId calculation needed
    } else {
      // If true, find the last semicolon in our untouched copy
      const lastSemicolonIndex = originalLineCopy.lastIndexOf(';');
      
      if (lastSemicolonIndex !== -1) {
        // Find the first quotation mark after that last semicolon
        const firstQuoteIndex = originalLineCopy.indexOf('"', lastSemicolonIndex);
        
        if (firstQuoteIndex !== -1) {
          // Find the next quotation mark immediately following it
          const lastQuoteIndex = originalLineCopy.indexOf('"', firstQuoteIndex + 1);
          
          if (lastQuoteIndex !== -1) {
            // Read all characters between those two isolated quotes
            const rawIdStr = originalLineCopy.substring(firstQuoteIndex + 1, lastQuoteIndex).trim();
            
            if (rawIdStr !== '') {
              extractedAggressorId = parseInt(rawIdStr, 10);
            }
          }
        }
      }
    }

    // Clean up trailing characters or trailing semicolons for the main 6 columns
    let baseLineToSplit = originalLineCopy;
    if (isRowActive && baseLineToSplit.includes('true')) {
      // Slice off the trailing quote block to protect the main standard split
      const lastSemi = baseLineToSplit.lastIndexOf(';');
      baseLineToSplit = baseLineToSplit.substring(0, lastSemi + 1);
    }
    
    if (baseLineToSplit.endsWith(';')) {
      baseLineToSplit = baseLineToSplit.slice(0, -1).trim();
    }

    const finalColumns = baseLineToSplit.split(';').map(val => val.trim());

    if (finalColumns.length < 2) return null;

    return {
      id: finalColumns[0] ? parseInt(finalColumns[0], 10) : null,
      status: (finalColumns[1] && finalColumns[1] !== '') ? parseInt(finalColumns[1], 10) : null, 
      timestamp: finalColumns[2] ? finalColumns[2].replace(/"/g, '') : null, 
      latitude: finalColumns[3] ? parseFloat(finalColumns[3]) : null,
      longitude: finalColumns[4] ? parseFloat(finalColumns[4]) : null,
      isActive: isRowActive, // Bind directly to our structural check
      aggressorId: isNaN(extractedAggressorId) ? null : extractedAggressorId
    };
  }).filter(Boolean); 
}


async function readEndpointJSON(URL) {
    
    let content = await fetch(URL)
    let data = await content.json()

    //scom.addSubjectToDB(data[0]['monitoradosEncontro'][0], 1, 2, false)
    //scom.addPositionOnDB(data[0]['monitoradosEncontro'][0],data[0]['timestamp'], data[0]['posicoes']['4']['lat'], data[0]['posicoes']['4']['lon'])

    //scom.addSubjectToDB(data[0]['monitoradosEncontro'][1], 1, 3, false)
    //scom.addPositionOnDB(data[0]['monitoradosEncontro'][1],data[0]['timestamp'], data[0]['posicoes']['6']['lat'], data[0]['posicoes']['6']['lon'])

    //console.log(data[0]['monitoradosEncontro'][1])

}

async function readEndpoint(URL) {
    
    const content = await fetch(URL)
    const data = await content.text()

    const parsedData =  parseSemicolonData(data)
    
    for(let i = 0; i < parsedData.length; i++) {
        
        //await sleep(5000);
        
        const aa = scom.pullSpecificSubjectFromDB(parsedData[i]['id'])

        const currentAggressorID = parsedData[i]['aggressorId']
        
        if(aa.length === 0) {
            
            let type = null
            
            if(parsedData[i]['status'] != null) {
                type = 1
            } else {
                type = 2
            }

            scom.addSubjectToDB(parsedData[i]['id'], type, parsedData[i]['status'], parsedData[i]['isActive'])

            if(parsedData[i]['isActive']) {
                
                if(!gt.checkRestrainingOrderProtectedList(parsedData[i]['id'])) {
                    
                    const bb = scom.pullSpecificSubjectFromDB(currentAggressorID)
                    
                    if(bb.length === 0) {
                        scom.addSubjectToDB(currentAggressorID, 2, null, false)
                    }   else {
                        scom.updateSubjectInformation(2, gt.getIdFromGangList(bb[0]['gang_affiliated']), false, currentAggressorID)    
                    }
                    
                    let list = scom.pullRestrainingOrderFromDB()
                    scom.addEntryToActiveRestrainingOrderOnDB((list.length + 1), parsedData[i]['id'], currentAggressorID)
                }

            }
        }

        if(!scom.checkIfPositionExists(parsedData[i]['id'], parsedData[i]['timestamp']))
        scom.addPositionOnDB(parsedData[i]['id'], parsedData[i]['timestamp'], parseFloat(parsedData[i]['latitude']), parseFloat(parsedData[i]['longitude']))


        if(aa.length > 0 && gt.checkRestrainingOrderListAggressors(parsedData[i]['id'])) {
            if(aa[0]['gang_affiliated'] === null) {
                scom.updateSubjectInformation(aa[0]['type'], parsedData[i]['status'], parsedData[i]['isActive'], parsedData[i]['id'])
            }
        }
        
        let lastFive = scom.pullLastFivePositionFromDB()

        for(let x = 0; x < lastFive.length; x++) {
            for(let z = x + 1; z <  lastFive.length; z++) {
                if(x === z)
                    continue

                
                if(lastFive[x]['timestamp'] === lastFive[z]['timestamp']) {
                    if(eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude']) < 0.02) {
                        let a = scom.pullSpecificSubjectFromDB(lastFive[x]['subject_id'])
                        let b = scom.pullSpecificSubjectFromDB(lastFive[z]['subject_id'])

                        if(!gt.checkIfEncounterAlreadyHappened(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude']))
                            if(a[0]['gang_affiliated'] != null && a[0]['gang_affiliated'] === b[0]['gang_affiliated']) {

                                gt.registerProvenEncounters(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])
                                json_to_display.push(JSON.parse(gt.encounterAlert('gang meeting',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude']))))
                                console.log(gt.encounterAlert('gang meeting',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])))

                            } else if(a[0]['restraining_order'] || b[0]['restraining_order']) {
                                if(gt.checkRestrainingOrderList(a[0], b[0])) {

                                        gt.registerProvenEncounters(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])
                                        json_to_display.push(JSON.parse(gt.encounterAlert('restraining order violation',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude']))))
                                        console.log(gt.encounterAlert('restraining order violation',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])))

                                }
                            } else {

                                gt.registerProvenEncounters(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])
                                json_to_display.push(JSON.parse(gt.encounterAlert('generic',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude']))))
                                console.log(gt.encounterAlert('generic',lastFive[x]['timestamp'], a[0], b[0], lastFive[x], lastFive[z], eq.getHaversineDistance(lastFive[x]['Latitude'], lastFive[x]['Longitude'], lastFive[z]['Latitude'], lastFive[z]['Longitude'])))

                            }
                    }
                }
            }
        }
    }


    //scom.addSubjectToDB(data[0]['monitoradosEncontro'][0], 1, 2, false)
    //scom.addPositionOnDB(data[0]['monitoradosEncontro'][0],data[0]['timestamp'], data[0]['posicoes']['4']['lat'], data[0]['posicoes']['4']['lon'])

    //scom.addSubjectToDB(data[0]['monitoradosEncontro'][1], 1, 3, false)
    //scom.addPositionOnDB(data[0]['monitoradosEncontro'][1],data[0]['timestamp'], data[0]['posicoes']['6']['lat'], data[0]['posicoes']['6']['lon'])

    //console.log(data[0]['monitoradosEncontro'][1])

}

/*

*/


readEndpoint('https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset1.txt')

module.exports = {
    readEndpoint,
    json_to_display,
};