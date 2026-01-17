const express = require("express");
const server = require("node:http").createServer();

const app = express();
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, () => console.log(`Listening on port 3000`));

process.on("SIGINT", () => {
  wss.clients.forEach((c) => {
    c.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

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

  db.run(`INSERT INTO visitors (count, time) 
      VALUES (${num_clients}, datetime('now'))
  `);

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

// start of databse
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
`);
});

function getCounts() {
  db.each(`SELECT * FROM visitors`, (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log(`Shutting down`);
  db.close();
}
