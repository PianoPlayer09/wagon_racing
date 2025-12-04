import ItalianCar from "./Car";

let websocket: WebSocket | null = null;
let connectionPromise: Promise<void> | null = null;

function establishConnection(): Promise<void> {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  } else if (connectionPromise) {
    return connectionPromise;
  } else {
    const websocketUrl = `ws://${window.location.hostname}:4242`;

    return (connectionPromise = new Promise((resolve) => {
      websocket = new WebSocket(websocketUrl);

      websocket.onopen = () => {
        console.log("websocket connection established");
        resolve();
      };
    }));
  }
}

export async function clientSendCar(gid: string, pid: string, car: ItalianCar) {
  await establishConnection();
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    console.log("NOT READY");
    return;
  }

  const carData = {
    type: "car",
    gid: gid,
    pid: pid,
    tick: Date.now(),
    xPos: car.x,
    yPos: car.y,
    xVel: car.velocity.xvel,
    yVel: car.velocity.yvel,
    xAcc: car.accelerationV.xacc,
    yAcc: car.accelerationV.yacc,
  };

  websocket.send(JSON.stringify(carData));
}

export async function onSocketMessage(
  handler: (data: any) => void,
) {
  await establishConnection();
  (websocket as WebSocket).onmessage = (event) => {
    handler(JSON.parse(event.data));
  };
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
    `/api/start?gameid=${gid}&kart=${krt}&color=${clr}`,
  ).then(async function (resp) {
    const json = await resp.json();
    return json as { playerid: string };
  });
  return player.playerid;
}
