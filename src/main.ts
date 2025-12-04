import GameLogic from "./game_logic";
import { Vec3 } from "./math";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const game = new GameLogic(canvas,"game1",new Vec3(1,0,0));
game.start();

// Later on, we can expand this to include menus, multiplayer setup, etc.

