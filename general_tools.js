const scom = require('/home/nikolas/Documents/Project_for_Trainee/server_commands')

const provenEncounter = []

function checkRestrainingOrderList(a, b) {
    let list = scom.pullRestrainingOrderFromDB()

    for(let i = 0; i < list.length; i++) {
        if(a['id'] == list[i]['aggressor']) {
            if(b['id'] == list[i]['protected']) {
                return true
            } else {
                return false
            }
        }
    }

    return false
}

function checkRestrainingOrderProtectedList(a) {
    let list = scom.pullRestrainingOrderFromDB()

    for(let i = 0; i < list.length; i++) {
        if(a['id'] == list[i]['protected']) {
            return true
        }
    }

    return false
}

function checkRestrainingOrderListAggressors(a) {
    let list = scom.pullRestrainingOrderFromDB()

    for(let i = 0; i < list.length; i++) {
        if(a['id'] == list[i]['aggressor']) {
            return true
        }
    }

    return false
}

function getIdFromGangList(name) {
    let list = scom.pullGangsFromDB()

    for(let i = 0; i < list.length; i++) {
        if(name === list[i]['name']) {
            return list[i]['id']
        }
    }
}

function encounterAlert(type, timestamp, a, b, a_loc, b_loc, dist) {
    let message = ''

    if(type === 'gang meeting') {
        message = 'faccao'
    } else if(type === 'restraining order violation') {
        message = 'protetiva'
    } else {
        message = 'generico'
    }

    let a_id = a['id']
    let b_id = b['id']

    if (a_id > b_id) {
    [a_id, b_id] = [b_id, a_id]
    [a_loc, b_loc] = [b_loc, a_loc]
    }

    let json_object = {
        'tipo': message,
        'monitoradosEncontro': [a_id,b_id],
        'timestamp': timestamp,
        'posicoes': {
            [a_id]: { 'lat': a_loc['Latitude'], 'lon': a_loc['Longitude']},
            [b_id]: { 'lat': b_loc['Latitude'], 'lon': b_loc['Longitude']},
        },
        'distanciaMetros' : dist * 1000,
    }

    json_object = JSON.stringify(json_object)

    return json_object
}

function registerProvenEncounters(lat_a, lon_a, lat_b, lon_b) {
    provenEncounter.push({
            'position_a': {'Latitude': lat_a, 'Longitude': lon_a},
            'position_b': {'Latitude': lat_b, 'Longitude': lon_b}
        })
}

function checkIfEncounterAlreadyHappened(lat_a, lon_a, lat_b, lon_b) {
    for(let x = 0; x < provenEncounter.length; x++) {
        if(provenEncounter[x]['position_a']['Latitude'] === lat_a
            && provenEncounter[x]['position_a']['Longitude'] === lon_a
                && provenEncounter[x]['position_b']['Latitude'] === lat_b
                    && provenEncounter[x]['position_b']['Longitude'] === lon_b) {
                        return true
        }
    }

    return false
}

module.exports = {
    checkRestrainingOrderList,
    checkRestrainingOrderList,
    checkRestrainingOrderProtectedList,
    checkRestrainingOrderListAggressors,
    getIdFromGangList,
    encounterAlert,
    provenEncounter,
    registerProvenEncounters,
    checkIfEncounterAlreadyHappened,
}