window.addEventListener("gamepadconnected", function(e){
    gamepadConnected = true;
    console.log(gamepadConnected);
});

window.addEventListener("gamepaddisconnected", function(e){
    gamepadConnected = false;
});

function checkGamepadKeys(){


}

Body.prototype.addGamepadEvent = function(button, targetFunction, parameterArray){

    controlArray.push(addKey.apply(this, [key, targetFunction, parameterArray]));

}