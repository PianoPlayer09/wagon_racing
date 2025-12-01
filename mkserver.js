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
        P1: null,
        P2: null,
        P3: null,
        P4: null
    }
    let ncr = new ItalianCar(clr,krt)
    let pl = {
        gameid: gid,
        playernumber: null,
        car: ncr,
        xacceleration:0,
        yacceleration:0
    }
    if(!(gid in games)){
        gm[track] = new track()
        games[gid] = gm
        
    }
    if(games.gid[P1]==null){
        games.gid[P1] = pid
        pl[playernumber]=1
    }
    else if(games.gid[P2]==null){
        games.gid[P2] = pid
        pl[playernumber]=2
    }
    else if(games.gid[P3]==null){
        games.gid[P3] = pid
        pl[playernumber]=3
    }
    else if(games.gid[P4]==null){
        games.gid[P4] = pid
        pl[playernumber]=4
    }
    else{
        res.send("game is full")
        return
    }
    clients[pid] = ncr

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