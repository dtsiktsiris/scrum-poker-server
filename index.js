const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server });

function getVotesByRoom(roomId) {
  let list = [];
  // parse all connected clients(same as ws)
  // and push choices in the list 
  wss.clients.forEach(function each(client) {
    if (client.choice != null && client.roomId == roomId) {
      list.push(client.choice)
    }
  });
  return list;
}

function sendVoteListToRoom(roomId, list) {
  // we send list with choices to all clients
  wss.clients.forEach(function each(client) {
    if (client.roomId == roomId) {
      client.send(JSON.stringify(list));
    }
  });
}

function sendStatuses(roomId) {
  let list = getVotesByRoom(roomId);

  if (list.includes('o') === true) {
    for (let i = 0; i < list.length; i++) {
      if (list[i] != 'o') {
        list[i] = 'x';
      }
    }
  }

  sendVoteListToRoom(roomId, list);
}

let rooms = new Map();

wss.on('connection', function connection(ws, req) {
  console.log('A new client Connected!');
  if (req.url.length > 1) {
    let rId = req.url.replace("/", "");
    if (rooms.has(rId)) {
      ws.roomId = rId;
      ws.choice = 'o';
      if (rooms.get(rId) === null) {
        rooms.set(rId, 1);
      }
      else {
        rooms.set(rId, rooms.get(rId) + 1);
      }
      sendStatuses(rId);
      console.log(rooms);
    }
    else {
      ws.send('room-not-found');
    }
  }
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // we save the choice of the user(message)
    // so to put it on list 
    if (message === 'create-room') {
      let roomNotFound = true;
      let roomNumber;
      while (roomNotFound) {
        roomNumber = Math.floor(Math.random() * Math.floor(10000));
        if (!rooms.has(roomNumber)) {
          roomNotFound = false;
          rooms.set(`${roomNumber}`, null);
          ws.send(roomNumber);
          ws.close();
        }
      }
      console.log(rooms);
    }
    else if (message === 'reset-votes') {
      let roomId = req.url.replace("/", "");
      wss.clients.forEach(function each(client) {
        if (client.choice != null && client.roomId == roomId) {
          client.choice = "o";
        }
      });
      sendStatuses(roomId);
    }
    else if (message === 'reveal-votes') {
      let roomId = req.url.replace("/", "");

      let list = getVotesByRoom(roomId);

      sendVoteListToRoom(roomId, list);

    }
    else if (req.url.length > 1) {
      if (rooms.has(req.url.replace("/", ""))) {
        ws.choice = message;
        sendStatuses(req.url.replace("/", ""));
      }
      else {
        ws.send('room-not-found');
      }
    }
  });
  ws.on('close', function closing(code, reason) {
    console.log("closing");
    if (rooms.has(req.url.replace("/", ""))) {
      let rId = req.url.replace("/", "");
      rooms.set(rId, rooms.get(rId) - 1);
      if (rooms.get(rId) < 1) {
        rooms.delete(rId);
      }
      else {
        sendStatuses(rId);
      }
    }
  })
});

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(3001, () => console.log(`Lisening on port :3001`))