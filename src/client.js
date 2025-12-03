//takes an italian car as input and then sends its data to the server
async function sendcar(car){
    await fetch('/api/val',{
        method: 'Post',
        body: JSON.stringify(car),
        headers:{
            'content-type':'application/JSON'
        }
    })
}

//returns the player object of a player specified by their playerid
async function getplayer(pid){
    let player=await fetch(`/api/player?playerid=${pid}`)
    return player
}

//returns an object with the track, players, and car objects in a game specified by the gameid
async function getgame(gid){
    let game = await fetch(`/api/game?gameid=${gid}`)
    return game
}

//starts a new game and gives the client their playerid
async function start(gid,krt,clr){
    let player = await fetch(`/api/start?gameid=${gid}&kart=${krt}$color=${clr}`).then(function(resp){
        resp=resp.json()
        return resp
    })
    player=player.playerid
    return player
}
