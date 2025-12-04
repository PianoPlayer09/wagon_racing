import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { v4 as uuidv4 } from "uuid";

import express from "express";
import { createServer } from 'http';
import parser from "body-parser";
import path from "path";

import { WebSocketServer, WebSocket } from "ws";

import ItalianCar from "./src/Car.js";

import CarPhysics from "./src/CarPhysics.ts"
import { createControlPoints, DEFAULT_OPTIONS } from "./src/road/index.js"

//object of all games in the form: (gameid):(game object)
const games = {};

//object of all clients in the form: (playerid):(player object)
const clients = {};

// generated roads info by game ID
const roads = {};

const PORT = 4242;
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(parser.json());

//https://betterstack.com/community/guides/scaling-nodejs/express-websockets/
const server = createServer(app)
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {

    const data = JSON.parse(msg.toString());

    let gameid = data.gid;
    if (!games[gameid]) {
      console.error("invalid gameid");
      return;
    }
    let playerid = data.pid;
    if (!clients[playerid]) {
      console.error("invalid playerid");
      return;
    }

    if (data.type == "car") {
      clients[playerid].tick = data.tick;
      clients[playerid].car.x = data.xPos;
      clients[playerid].car.y = data.yPos;
      clients[playerid].car.theta = data.theta;
      clients[playerid].car.currentSpeed = data.currentSpeed;
      clients[playerid].car.omega = data.omega;
    }
  });
});

let serverTick = 0;
const tickRate = 60;
const tickDt = 1.0 / tickRate;

function broadcastState() {
  const snapshot = {
    type: "state",
    tick: serverTick++,
    cars: Object.entries(clients).map(([pid, data]) => ({
      pid: pid,
      car: {
        x: data.car.x,
        y: data.car.y,
        theta: data.car.theta,
        currentSpeed: data.car.currentSpeed,
        omega: data.car.omega
      },
    })),
  };

  const payload = JSON.stringify(snapshot);

  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}

const zeroInput = {
  up: false,
  down: false,
  right: false,
  left: false,
};

function stepPhysics() {
  for (let i in clients) {
    const nextP = CarPhysics.update(clients[i].car, zeroInput, tickDt);
    CarPhysics.updatePosition(clients[i].car, nextP);
  }
}

setInterval(() => {
  stepPhysics();
  broadcastState();
}, tickDt * 1000);

app.get("/api/road/controlpoints", function (req, res) {
  const gid = req.query.gameid;

  if (!roads[gid]) {
    roads[gid] = JSON.parse(JSON.stringify(DEFAULT_OPTIONS))
    roads[gid].controlPoints = createControlPoints(DEFAULT_OPTIONS).map(v => [v.x,v.y,v.z])
    console.log(roads[gid].controlPoints)
  }

  res.json(roads[gid]);
});

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
    velocity: `(${clients.pid.car.currentSpeed}, ${clients.pid.car.theta})`,
    acceleration: `(${clients.pid.car.omega})`,
  };
  res.send(JSON.stringify(packet));
});

//sends game info as detailed in the api
app.get("/api/game", function (req, res) {
  const gid = req.query.gameid;
  const gm = games[gid];
  const packet = {
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
