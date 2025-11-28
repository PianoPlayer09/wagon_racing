// defines the inputs states used in rest of the game
//Input Processing
/**
 * @const ItalianCarnputStates
 * @description Process user input events to determine the current state of arrow key presses.
 * @events listens for keydown and keyup events for arrow keys.
 * @return object representing which arrow keys are pressed.
 */
export const inputStates = {
    up: false,
    down: false,
    left: false,
    right: false
};
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
        inputStates.up = true;
    }
    if (e.key === 'ArrowDown') {
        inputStates.down = true;
    }
    if (e.key === 'ArrowLeft') {
        inputStates.left = true;
    }
    if (e.key === 'ArrowRight') {
        inputStates.right = true;
    }
});
window.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp') {
        inputStates.up = false;
    }
    if (e.key === 'ArrowDown') {
        inputStates.down = false;
    }
    if (e.key === 'ArrowLeft') {
        inputStates.left = false;
    }
    if (e.key === 'ArrowRight') {
        inputStates.right = false;
    }
});
export default inputStates;
