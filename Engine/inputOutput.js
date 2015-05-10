var buttonMapping = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "back", "start", "L analogue down", "R analogue down",
    "D Up", "D down", "D left", "D right"];

window.addEventListener("gamepadconnected", function (e) {
    gamepadConnected = true;
    //console.log(navigator.getGamepads(0));
});

window.addEventListener("gamepaddisconnected", function (e) {
    gamepadConnected = false;
});

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

Body.prototype.addGamepadEvent = function (button, targetFunction, parameterArray) {

    gamepadArray.push(addKey.apply(this, [button, targetFunction, parameterArray, gamepadArray]));

};

//Mouse and keyboard Functions

/** Called every time the mouse is moved
 *
 * @param e
 */

var mouseMoveListener = function (e) {

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    mouse.x = (e.offsetX || e.layerX) / physics.scale;
    mouse.y = (e.offsetY || e.layerY) / physics.scale;

    listen(mouseMoveListener);

};

var mouseClick = function(e){

    listen(mouseClick);

};

var mouseRelease = function(e){

    listen(mouseRelease);

};

var mousePressed = function(e){

    listen(mousePressed);

};

function createMouseJoint() {

    var e = Event;


}

/** Add a keyboard key for later event trigger purposes
 *
 * @param key
 * @param targetFunction
 * @param parameterArray
 * @param keyArray
 * @returns {{}}
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
 * @param e
 */

document.onkeydown = function (e) {

    anyKeyDown();

    if (pressedKeysArray.indexOf(e.keyCode) == -1) {
        pressedKeysArray.push(e.keyCode);
    }

};

/** Remove key from event testing array when is it released
 *
 * @param e
 */

document.onkeyup = function (e) {

    anyKeyUp();

    pressedKeysArray.splice(pressedKeysArray.indexOf(e.keyCode), 1);
    releasedKeysArray.push(e.keyCode);
};

function anyKeyDown(){
    listen(anyKeyDown);
}

function anyKeyUp(){
    listen(anyKeyUp);
}

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

/** Check which keys are currently pressed or have just been released against the list of keys with events attached to them.
 *
 * @param actualKeys
 * @param keysToCheck
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