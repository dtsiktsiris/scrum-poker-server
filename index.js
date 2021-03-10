const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server });

function sendStatuses() {
  let list = [];

  // parse all connected clients(same as ws)
  // and push choices in the list 
  wss.clients.forEach(function each(client) {
    if (client.choice != null) {
      list.push(client.choice)
    }
  });

  if (list.includes('o') === true) {
    for (let i = 0; i < list.length; i++) {
      if (list[i] != 'o') {
        list[i] = 'x';
      }
    }
  }

  // we send list with choices to all clients
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(list));
  });
}

wss.on('connection', function connection(ws, req) {
  console.log('A new client Connected!');
  ws.choice = 'o';

  sendStatuses();

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // we save the choice of the user(message)
    // so to put it on list 
    ws.choice = message;

    sendStatuses();

  });
  ws.on('close', function closing(code, reason) {
    console.log("closing");
  })
});

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(3001, () => console.log(`Lisening on port :3001`))