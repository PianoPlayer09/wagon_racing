SOIUGNSOGIN
* Get /wagon_race - opens the intro page of the website
* Get /wagon_race/events - set up a SSE stream for push updates. Each update is a JSON-encoded string of gameid and action 
* Get /wagon_race/game - returns info about the current game using url encoded data
* * gameid - id of the current game
* * obstacles - will be added later
* * players - the list of playerids
* * positions - the list of player positions as a dictionary of (player id)=(x,y)
* Get /wagon_race/start - Creates/joins a game using the following url encoded params
* * gameid - gameid of game to create/join
* * playerid - player id of the player joining
* * kart - type of kart of the player wanting to join (light, medium, or heavy)
* * color - color of the kart of player wanting to join
* Get /wagon_race/player - returns info about the current player using url encoded data.
* * position - the players position (x,y)
* * velocity - the players velocity (xVel,yVel)
* * acceleration - the players acceleration (xAcc, yAcc)
* Post /wagon_race/val - update acceleration, velocity, and position with json encoded data
* * gameid - the game id of the relvant game(might remove later but makes my life easier for now)
* * playerid - the id of he relevant player
* * xAcc - the x acceleration of the relevant player
* * yAcc - the y acceleration of the relevent player