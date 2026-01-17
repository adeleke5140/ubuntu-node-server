const express = require("express");
const server = require("node:http").createServer();

const app = express();
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, () => console.log(`Listening on port 3000`));

/** Begin Websockets **/
const wsserver = require("ws").Server;

const wss = new wsserver({ server: server });

wss.on("connection", function connection(ws) {
  const num_clients = wss.clients.size;
  console.log(`Clients connected`, num_clients);
  wss.broadcast(`Current visitors ${num_clients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  ws.on("close", function close() {
    wss.broadcast(`Current visitors ${num_clients}`);
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
