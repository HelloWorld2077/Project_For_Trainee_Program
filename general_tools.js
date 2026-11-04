const scom = require('/home/nikolas/Documents/Project_for_Trainee/server_commands')

const provenEncounter = []

function checkRestrainingOrderList(a, b) {
    let list = scom.pullRestrainingOrderFromDB();

    for(let i = 0; i < list.length; i++) {
        const aIsAggressor =
            a.id === list[i].aggressor &&
            b.id === list[i].protected;

        const bIsAggressor =
            b.id === list[i].aggressor &&
            a.id === list[i].protected;

        if(aIsAggressor || bIsAggressor) {
            return true;
        }
    }

    return false;
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

function registerProvenEncounters(person_a_id, person_b_id, timestamp) {
    provenEncounter.push({
            'person_a_id': person_a_id,
            'person_b_id': person_b_id,
            'timestamp': timestamp,
        })
}

function checkIfEncounterAlreadyHappened(person_a_id, person_b_id, timestamp) {

    for(let i = 0; i < provenEncounter.length; i++) {
        if((person_a_id === provenEncounter[i]['person_a_id'] && person_b_id === provenEncounter[i]['person_b_id'])
            || (person_b_id === provenEncounter[i]['person_b_id'] && person_a_id === provenEncounter[i]['person_a_id'])) {
                
                if(timestamp === provenEncounter[i]['timestamp']){
                    return true
                }

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