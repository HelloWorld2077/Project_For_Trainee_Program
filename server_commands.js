const { Database } = require('node:sqlite');

const db = new Database('./DB/Master');

function pullSubjectsFromDB() {

    const dbc = db.prepare(`
    SELECT 
        subjects.*, 
        types.name AS type,
        gangs.name AS gang_affiliated
    FROM subjects
    JOIN types ON subjects.type = types.id
    JOIN gangs ON subjects.gang_affiliated = gangs.id;
`);
    const a = dbc.all()

    return a
}

function pullSpecificSubjectFromDB(Subject_id) {
    const dbc = db.prepare(`
    SELECT 
        subjects.id,
        types.name AS type,
        gangs.name AS gang_affiliated,
        subjects.restraining_order
    FROM subjects
    LEFT JOIN types ON subjects.type = types.id
    LEFT JOIN gangs ON subjects.gang_affiliated = gangs.id
    WHERE subjects.id = ?;
`);

    const a = dbc.all(Subject_id)

    return a
}

function pullPositionsFromDB() {

    const dbc = db.prepare(`
    SELECT * FROM locations;
`);
    const a = dbc.all()

    return a
}

function pullRestrainingOrderFromDB() {
    const dbc = db.prepare(`
    SELECT * FROM active_restraining_orders;
`);
    const a = dbc.all()

    return a
}

function pullGangsFromDB() {
    const dbc = db.prepare(`
    SELECT * FROM gangs;
`);
    const a = dbc.all()

    return a
}

function addPositionOnDB(Subject_id, timestamp, Latitude, Longitude) {

    //const dbTimestamp = isoString.replace('T', ' ').slice(0, 19);

    const dbc = db.prepare(`
        INSERT INTO locations (subject_id, timestamp, latitude, longitude)
        VALUES (?, ?, ?, ?);
    `);

    dbc.run(Subject_id, timestamp, Latitude, Longitude);
}

function addSubjectToDB(id, type, gang_affiliated, restraining_order) {

    const dbc = db.prepare(`
        INSERT INTO subjects (id, type, gang_affiliated, restraining_order)
        VALUES (?, ?, ?, ?);
    `);

    dbc.run(id, type, gang_affiliated, restraining_order);
}

function addEntryToActiveRestrainingOrderOnDB(id, protected, aggressor) {
    const dbc = db.prepare(`
        INSERT INTO active_restraining_orders (id, protected, aggressor)
        VALUES (?, ?, ?);
    `);

    dbc.run(id, protected, aggressor);
}

function updateSubjectInformation(type, gang_affiliated, restraining_order, Subject_id) {
    const dbc = db.prepare(`
        UPDATE  subjects
        SET type = ?, gang_affiliated = ?, restraining_order = ?
        WHERE id = ?;
    `);

    dbc.run(type, gang_affiliated, restraining_order, Subject_id);
}

function pullLastFivePositionFromDB() {
    
    const dbc = db.prepare(`
    SELECT id, subject_id, timestamp, Latitude, Longitude
    FROM (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY subject_id
                ORDER BY id DESC
           ) AS position_rank
    FROM locations
    )
    WHERE position_rank = 1
    ORDER BY id DESC
    LIMIT 20;`)

    return dbc.all()
}

// Add this helper to your database helper file (scom)
function checkIfPositionExists(subject_id, timestamp) {
    const dbc = db.prepare(`
        SELECT 1 FROM locations 
        WHERE subject_id = ? AND timestamp = ? 
        LIMIT 1;
    `);
    const row = dbc.get(subject_id, timestamp);
    return row !== undefined; // Returns true if it exists, false if it's new
}


//test = pullLastFivePositionFromDB()
//console.log(test[0])

//console.log(pullSpecificSubjectFromDB(5))

module.exports = {
    pullSubjectsFromDB,
    pullSpecificSubjectFromDB,
    pullRestrainingOrderFromDB,
    pullPositionsFromDB,
    pullLastFivePositionFromDB,
    pullGangsFromDB,
    addPositionOnDB,
    addSubjectToDB,
    addEntryToActiveRestrainingOrderOnDB,
    updateSubjectInformation,
    checkIfPositionExists,
};