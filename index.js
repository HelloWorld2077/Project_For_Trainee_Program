const http = require('node:http');
const scom = require('/home/nikolas/Documents/Project_for_Trainee/server_commands')
const ep = require('/home/nikolas/Documents/Project_for_Trainee/endpoint_gathering')
const gt = require('/home/nikolas/Documents/Project_for_Trainee/general_tools')

const hostname = '127.0.0.1';
const port = 3000;


/*
Subject being monitored

We'll be storing his:
Id
Type: Meaning if he's either an offender/aggressor or a protected person(which can or cannot be a victim)
gang_affiliated: which gang he's affiliated, if none then it will return a string saying 'none'
restrain_order: Is there an active restraining order related to this person?

*/

const server = http.createServer((req, res) => {

  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(ep.json_to_display, null, 4));

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
