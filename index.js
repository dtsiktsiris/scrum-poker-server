const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server });

wss.on('connection', function connection(ws, req) {
  console.log('A new client Connected!');

  ws.send('Welcome New Client!');
  // console.log(req.url);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    ws.choice = message;
    // console.log(ws.choice);
    // const parameters = url.parse(req.url, true);

    // ws.uid = wss.getUniqueID();
    // ws.chatRoom = {uid: parameters.query.myCustomID};
    let list = [];
    
    console.log(list);
    
    wss.clients.forEach(function each(client) {
      if (client.choice != null) {
        list.push(client.choice)
      }
    });

    wss.clients.forEach(function each(client) {
      // if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(list));
      // }
    });

  });
  ws.on('close', function closing(code, reason) {
    console.log("closing");
  })
});

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(3000, () => console.log(`Lisening on port :3000`))