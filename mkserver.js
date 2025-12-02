const express = require("express")
const parser = require("body-parser")
const path = require("path")
const {v4: uuidv4} = require('uuid')

const cars = require(path.join(__dirname, 'src', 'Car.js'))
const carphys=require(path.join(__dirname, 'src', 'CarPhysics.ts'))

//should prob implement a class for tracks
const track=require(path.join(__dirname, 'src', 'track.js'))


const games = {}
const clients = {}

const PORT = 4242
const app = express();
app.use("/static", express.static(path.join(__dirname, "public")) )
app.use(parser.json())



app.get("/wagon_race", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"))
})
app.get("/wagon_race/start", function(req,res){
    let gid = req.query.gameid
    let pid = req.query.playerid
    let krt = req.query.kart
    let clr = req.query.color
    let gm = {
        track: null,
        Players: null,
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
    if(games.gid[P1]==null){
        games.gid.Players.push(pid)
        pl[playernumber]=1
        games.gid[numPlayers]=1
    }
    else if(games.gid[P2]==null){
        games.gid.Players.push(pid)
        pl[playernumber]=2
        games.gid[numPlayers]=2
    }
    else if(games.gid[P3]==null){
        games.gid.Players.push(pid)
        pl[playernumber]=3
        games.gid[numPlayers]=3
    }
    else if(games.gid[P4]==null){
        games.gid.Players.push(pid)
        pl[playernumber]=4
        games.gid[numPlayers]=4
    }
    else{
        res.send("game is full")
        return
    }
    clients[pid] = ncr

})
app.get('/wagon_race/player', function(req, res){
    const pid = req.query.playerid
    const packet={
        position: `(${clients.pid.car.position[x]}, ${clients.pid.car.position[y]})`,
        velocity: `(${clients.pid.car.velocity[xvel]}, ${clients.pid.car.velocity[yvel]})`,
        acceleration: `(${clients.pid.car.acceleration[xacc]}, ${clients.pid.car.acceleration[yacc]})`,
    }
    res.send(JSON.stringify(packet))

})
app.get('/wagon_race/game', function(req,res){
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
app.post('/wagon_race/val', function(req, res){
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
    clients.playerid[x]=req.body.xPos
    clients.playerid[y]=req.body.yPos
    clients.playerid[xvel]=req.body.xVel
    clients.playerid[yvel]= req.body.yVel
    clients.playerid[xacc]= req.body.xAcc
    clients.playerid[yacc]= req.body.yAcc
    sendEvent(gameid, playerid)

})

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

app.get("/wagon_race/events", function(req, res){
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