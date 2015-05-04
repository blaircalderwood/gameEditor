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