import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { v4 as uuidv4 } from "uuid";

import express from "express";
import parser from "body-parser";
import path from "path";

import { Websocket } from "ws";

import ItalianCar from "./src/Car.js";

//object of all games in the form: (gameid):(game object)
const games = {};

//object of all clients in the form: (playerid):(player object)
const clients = {};

const PORT = 4242;
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(parser.json());

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    let gameid = msg.gid;
    if (!games[gameid]) {
      console.error("invalid gameid");
      return;
    }
    let playerid = msg.pid;
    if (!clients[playerid]) {
      console.error("invaild playerid");
      return;
    }

    if (msg.type == "car") {
      clients[playerid].tick = msg.tick;
      clients[playerid].car.x = msg.xPos;
      clients[playerid].car.y = msg.yPos;
      clients[playerid].car.xvel = msg.xVel;
      clients[playerid].car.yvel = msg.yVel;
      clients[playerid].car.xacc = msg.xAcc;
      clients[playerid].car.yacc = msg.yAcc;
    }
  });
});

let serverTick = 0;
const tickRate = 30;
const tickDt = 1.0 / tickRate;

function broadcastState() {
  const snapshot = {
    type: "state",
    tick: serverTick++,
    cars: clients.entries().map(([pid, data]) => ({
      pid: pid,
      car: data.car,
    })),
  };
  const payload = JSON.stringify(snapshot);
  for (const ws of wss.clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

const zeroInput = {
  up: false,
  down: false,
  right: false,
  left: false,
};

function stepPhysics() {
  for (i in clients) {
    const nextP = CarPhysics.update(clients[i].car, zeroInput, dt);
    CarPhysics.updatePosition(clients[i].car, nextP);
  }
}

setInterval(() => {
  stepPhysics();
  broadcastState();
}, tickDt * 1000);

/**
 * joins a game with the provided gameid and creates a new one if it doen't exist
 * game objects have a track object, a list of player ids, and the number of players
 * also creates a new player object
 * player objects have their playerids, gameids, player number, and their car object
 */
app.get("/api/start", function (req, res) {
  let gid = req.query.gameid;
  let pid = uuidv4();
  let krt = req.query.kart;
  let clr = req.query.color;
  let gm = {
    track: null,
    Players: [],
    numPlayers: null,
  };
  let ncr = new ItalianCar(clr, krt);
  let pl = {
    playerid: pid,
    gameid: gid,
    playernumber: null,
    car: ncr,
  };
  if (!(gid in games)) {
    games[gid] = gm;
  }
  games[gid].Players.push(pid);
  pl.playernumber = games[gid].Players.length;
  games[gid].numPlayers = games[gid].Players.length;
  clients[pid] = { car: ncr };
  const packet = {
    playerid: `${pid}`,
  };

  console.log(`player ${pid} started game ${gid}`);
  res.send(JSON.stringify(packet));
});

//sends player info as detailed in the apiin nodejs I want to use websockets to allow clients t
app.get("/api/player", function (req, res) {
  const pid = req.query.playerid;
  const packet = {
    position: `(${clients.pid.car.position[x]}, ${clients.pid.car.position[y]})`,
    velocity: `(${clients.pid.car.velocity[xvel]}, ${clients.pid.car.velocity[yvel]})`,
    acceleration: `(${clients.pid.car.acceleration[xacc]}, ${clients.pid.car.acceleration[yacc]})`,
  };
  res.send(JSON.stringify(packet));
});

//sends game info as detailed in the api
app.get("/api/game", function (req, res) {
  const gid = req.query.gameid;
  const gm = games[gid];
  let packet = {
    obstacles: `${gm.track[obstacles]}`,
    players: ``,
    cars: ``,
  };
  let players = gm.Players;
  let crs = [];
  for (let p of players) {
    let cr = `(${p})=(${clients.p.car}, ${clients.p.car})`;
    crs.push[cr];
  }
  packet.players = players;
  packet.cars = crs;
  res.send(JSON.stringify(packet));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//https://community.render.com/t/can-i-use-express-and-websocket-on-same-service-node/8015/2
app.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
