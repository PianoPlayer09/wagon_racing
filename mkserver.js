import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const {v4: uuidv4} = require('uuid')

import express from 'express';
import parser from 'body-parser';
import path from 'path';

import ItalianCar from './src/Car.js';

//object of all games in the form: (gameid):(game object)
const games = {}

//object of all clients in the form: (playerid):(player object)
const clients = {}

const PORT = 4242
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")) )
app.use(parser.json())

/**
 * joins a game with the provided gameid and creates a new one if it doen't exist
 * game objects have a track object, a list of player ids, and the number of players
 * also creates a new player object
 * player objects have their playerids, gameids, player number, and their car object
 */
app.get("/api/start", function(req,res){
    let gid = req.query.gameid
    let pid = uuidv4()
    let krt = req.query.kart
    let clr = req.query.color
    let gm = {
        track: null,
        Players: [],
        numPlayers: null,
    }
    let ncr = new ItalianCar(clr,krt)
    let pl = {
        playerid: pid,
        gameid: gid,
        playernumber: null,
        car: ncr,
    }
    if(!(gid in games)){
        gm[track] = new track()
        games[gid] = gm
        
    }
    games.gid.Players.push(pid)
    pl[playernumber]=games.gid.Players.length
    games.gid[numPlayers]=games.gid.Players.length
    clients[pid] = ncr
    packet={
        playerid:`${pid}`
    }
    res.send(JSON.stringify(packet))

})
//sends player info as detailed in the api
app.get('/api/player', function(req, res){
    const pid = req.query.playerid
    const packet={
        position: `(${clients.pid.car.position[x]}, ${clients.pid.car.position[y]})`,
        velocity: `(${clients.pid.car.velocity[xvel]}, ${clients.pid.car.velocity[yvel]})`,
        acceleration: `(${clients.pid.car.acceleration[xacc]}, ${clients.pid.car.acceleration[yacc]})`,
    }
    res.send(JSON.stringify(packet))

})

//sends game info as detailed in the api
app.get('/api/game', function(req,res){
    const gid = req.query.gameid
    const gm = games[gid]
    let packet = {
        obstacles:`${gm.track[obstacles]}`,
        players:``,
        positions:``,
    }
    let players=gm.Players
    let positions=[]
    for(let p of players){
        let pos= `(${p})=(${clients.p.car.position[x]}, ${clients.p.car.position[y]})`
        positions.push[pos]
    }
    packet[players]=players
    packet[positions]=positions
    res.send(JSON.stringify(packet))

    

})

//updates pos,vel, and acc of a valid player in a valid game
app.post('/api/val', function(req, res){
    const packet = {
        status: 'error',
        message: 'prob an invalid ID or smth'
    }
    let gameid = req.body.gameid
    if( !(gameid in games) ){
        packet[message] = "invalid gameid"
        res.send(JSON.stringify(packet))
        return;
    }
    let playerid = req.body.playerid
    if( !(playerid in clients) ){
        packet[message] = "invaild playerid"
        res.send(JSON.stringify(packet))
        return;
    }
    clients.playerid.car.position[x]=req.body.xPos
    clients.playerid.car.position[y]=req.body.yPos
    clients.playerid.car.velocity[xvel]=req.body.xVel
    clients.playerid.car.velocity[yvel]= req.body.yVel
    clients.playerid.car.acceleration[xacc]= req.body.xAcc
    clients.playerid.car.acceleration[yacc]= req.body.yAcc
    sendEvent(gameid, playerid)

})

//sends an event which just says there was an update
function sendEvent(gameid, playerId){
    let packet = JSON.stringify({
        gameid,
        playerId,
        action: 'update'
    })
    for( let client in clients ){
        clients[client].response.write(`data: ${packet}\n\n`)
    }
}

//sets up event stream, idk how though
app.get("/api/events", function(req, res){
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    let client = {
        clientID: Date.now(),
        response: res
    }
    clients[client.clientID] = client

    res.on('close', () => {
        delete clients[client.clientID];
        res.end();
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});