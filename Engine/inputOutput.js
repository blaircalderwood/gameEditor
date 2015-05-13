var buttonMapping = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "back", "start", "L analogue down", "R analogue down",
    "D Up", "D down", "D left", "D right"];

/** Check if gamepad is connected
 *
 */

window.addEventListener("gamepadconnected", function (e) {
    gamepadConnected = true;
});

/** Check if gamepad is disconnected
 *
 */

window.addEventListener("gamepaddisconnected", function (e) {
    gamepadConnected = false;
});

/** Check which gamepad keys are being pressed
 *
 */

function checkGamepadKeys() {

    var gamepad = navigator.getGamepads()[0];
    var keys = [];

    for (var i = 0; i < gamepad.buttons.length; i++) {

        if (gamepad.buttons[i].pressed) {
            console.log(buttonMapping[i]);
            keys.push(buttonMapping[i]);
        }
    }

    checkKeys(keys, gamepadArray);

}

/** Add an event which executes when a gamepad button is pressed
 *
 * @param button - Button that will execute event when pressed
 * @param targetFunction - Event to be executed
 * @param parameterArray - Array of parameters to be passed into target function
 */

Body.prototype.addGamepadEvent = function (button, targetFunction, parameterArray) {

    gamepadArray.push(addKey.apply(this, [button, targetFunction, parameterArray, gamepadArray]));

};

//Mouse and keyboard Functions

/** Called every time the mouse is moved
 *
 * @param e - Contains mouse data
 */

var mouseMoveListener = function (e) {

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    mouse.x = (e.offsetX || e.layerX) / physics.scale;
    mouse.y = (e.offsetY || e.layerY) / physics.scale;

    listen(mouseMoveListener);

};

/**Check if the mouse has been clicked
 *
 * @param e - Contains mouse data
 */

var mouseClick = function(e){

    listen(mouseClick);

};

/**Check if the mouse has been released
 *
 * @param e - Contains mouse data
 */

var mouseRelease = function(e){

    listen(mouseRelease);

};

/**Check if the mouse has been pressed
 *
 * @param e - Contains mouse data
 */

var mousePressed = function(e){

    listen(mousePressed);

};

/** Add a keyboard key for later event trigger purposes
 *
 * @param key - Key to be checked
 * @param targetFunction - Function to be executed on key press
 * @param parameterArray - Array of parameters to be passed into target function
 * @param keyArray - Array of keys (either keyboard keys or gamepad buttons)
 * @returns {{}} - Key with all relevant data attached
 */

function addKey(key, targetFunction, parameterArray, keyArray) {

    var newFunction = eval("this." + targetFunction);
    var newKey = {};
    newKey.id = key;

    if (parameterArray && parameterArray.length > -1) {
        newFunction.parameterArray = parameterArray;
    }
    else {
        newFunction.parameterArray = [parameterArray];
    }

    newFunction.bodyObject = this;
    newFunction.functionName = targetFunction;

    var controlPos = keyArray.indexOf(newKey);

    if (controlPos == -1) {
        newKey.functions = [newFunction];
    }
    else if (controlPos > -1) {
        newKey.functions.push(newFunction);
    }

    eventsArray.push(newFunction);
    if(newKey.elements = [])newKey.elements = [];

    newKey.elements.push(this);
    return newKey;

}

/** When a key is pressed push it to an array for later event testing
 *
 * @param e - Contains keyboard data
 */

document.onkeydown = function (e) {

    if (pressedKeysArray.indexOf(e.keyCode) == -1) {
        pressedKeysArray.push(e.keyCode);
    }

    listen(anyKeyDown);

};

/** Remove key from event testing array when is it released
 *
 * @param e - Contains keyboard data
 */

document.onkeyup = function (e) {
    pressedKeysArray.splice(pressedKeysArray.indexOf(e.keyCode), 1);
    releasedKeysArray.push(e.keyCode);
    listen(anyKeyUp);
};

/** Check which keys are currently being pressed
 *
 */

function checkPressedKeys() {
    checkKeys(pressedKeysArray, controlArray);
}

/** Check which keys have just been released
 *
 */

function checkReleasedKeys() {

    checkKeys(releasedKeysArray, controlReleasedArray);
    releasedKeysArray = [];

}

function anyKeyDown(){}

function anyKeyUp(){}

/** Check which keys are currently pressed or have just been released against the list of keys with events attached to them.
 *
 * @param actualKeys - Keys that are currently being pressed
 * @param keysToCheck - Keys that have events attached to them
 */

function checkKeys(actualKeys, keysToCheck) {

    var result = [];

    if (actualKeys.length > 0) {

        for (var i = 0; i < actualKeys.length; i++) {
            for (var k = 0; k < keysToCheck.length; k++) {

                if (actualKeys[i] == keysToCheck[k].id.toASCII() || actualKeys[i] == keysToCheck[k].id) {
                    result.push(keysToCheck[k]);
                }

            }
        }

        for (var j = 0; j < result.length; j++) {
            listen(result[j]);
        }

    }

}