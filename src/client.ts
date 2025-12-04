import ItalianCar from "./Car";

//takes an italian car as input and then sends its data to the server
export async function clientSendCar(gid: string, pid: string, car: ItalianCar) {
  console.log(car);
  await fetch("/api/val", {
    method: "Post",
    body: JSON.stringify({
      gid,
      pid,
        xPos: car.x,
        yPos: car.y,
        xVel: car.velocity.xvel,
        yVel: car.velocity.yvel,
        xAcc: car.accelerationV.xacc,
        yAcc: car.accelerationV.yacc
    }),
    headers: {
      "content-type": "application/JSON",
    },
  }).then((resp) => resp.json().then((x) => console.log(x)));
}

//returns the player object of a player specified by their playerid
export async function clientGetPlayer(pid: string) {
  let player = await fetch(`/api/player?playerid=${pid}`);
  return player;
}

//returns an object with the track, players, and car objects in a game specified by the gameid
export async function clientGetGame(gid: string) {
  let game = await fetch(`/api/game?gameid=${gid}`);
  return game;
}

//starts a new game and gives the client their playerid
export async function clientStart(gid: string, krt: string, clr: any) {
  let player = await fetch(
    `/api/start?gameid=${gid}&kart=${krt}$color=${clr}`,
  ).then(async function (resp) {
    const json = await resp.json();
    return json as { playerid: string };
  });
  return player.playerid;
}
