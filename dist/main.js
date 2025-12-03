import GameLogic from "./game_logic";
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const game = new GameLogic(canvas);
game.start();
// Later on, we can expand this to include menus, multiplayer setup, etc.
