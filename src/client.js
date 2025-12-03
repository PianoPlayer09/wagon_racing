async function sendcar(car){
    await fetch('/api/val',{
        method: 'Post',
        body: JSON.stringify(car),
        headers:{
            'content-type':'application/JSON'
        }
    })
}

async function getplayer(pid){
    let player=await fetch(`/api/player?playerid=${pid}`)
    return player
}

async function getgame(gid){
    let game = await fetch(`/api/game?gameid=${gid}`)
    return game
}

async function start(gid,krt,clr){
    let player = await fetch(`/api/start?gameid=${gid}&kart=${krt}$color=${clr}`).then(function(resp){
        resp=resp.json()
        return resp
    })
    player=player.playerid
    return player
}
