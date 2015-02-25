var gameElementsArray = [], buttonsArray = [], textArray = [], backgroundsArray = [], canvasArray = [], spriteArray = [],
    keyArray = [], pressedKeysArray = [], releasedKeysArray = [], destroyArray = [], controlArray = [],
    controlReleasedArray = [];
var exampleCanvas, backgroundCanvas, physicsCanvas;
var mouse = {x: 0, y: 0, width: 10, height: 10, savedX: -1, savedY: -1}, mouseBody;
var physics;
var lastFrame = new Date().getTime();
var physicsEnabled = true, engineStarted = false;
var fileRead;

//Constructor Functions

function ControlBinding(control, targetFunction) {

    control = control.toUpperCase();
    this.code = control.toASCII();
    this.targetFunction = targetFunction;

    //keyArray.push(this);

}

function newControl(control, targetFunction) {

    control = control.toUpperCase();
    control = control.toASCII();

    return ({control: control, targetFunction: targetFunction});

}

function Button(x, y, width, height, zIndex, targetCanvas, targetFunction, text, bgColour, fontType, fontSize, fontColour) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.targetCanvas = targetCanvas;
    this.targetFunction = targetFunction;
    this.text = text;

    if (bgColour) {
        this.bgColour = bgColour;
    }

    if (fontType && doesFontExist(fontType)) {
        this.fontType = fontType;
    }
    else {
        console.log("Font is not supported. Using replacement font.");
        this.fontType = "Arial";
    }

    if (fontSize > 0) {
        this.fontSize = fontSize;
        console.log(this.fontSize);
    }
    else {
        console.log("Font Size is not number. Using replacement size.");
        this.fontSize = 11;
    }

    if (fontColour) {
        this.fontColour = fontColour;
    }

    gameElementsArray.push(this);

}

function Background(x, y, width, height, zIndex, img, colour) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;

    if (img) {
        this.img = img;
    }
    else {
        this.colour = colour;
    }

}

function CanvasElement(DOMElement, x, y, width, height) {

    this.canvas = document.getElementById(DOMElement);
    this.context = this.canvas.getContext("2d");
    this.canvas.x = x;
    this.canvas.y = y;
    this.canvas.width = width;
    this.canvas.height = height;

}

window.onload = function () {

    setUpCanvases();

    if (physicsEnabled) {
        physics = window.physics = new Physics(physicsCanvas.canvas);
    }

    //engineReady(physics);

    var tempText = localStorage.getItem('compiledText');
    eval(tempText);

};

function startEngine() {

    if (imagesLoaded) {
        requestAnimationFrame(redraw);
    }

    createMouseJoint();

    engineStarted = true;

}

function setUpCanvases() {

    physicsCanvas = new CanvasElement("physicsCanvas", 0, 0, $(window).width(), $(window).height());
    exampleCanvas = new CanvasElement("exampleCanvas", 0, 0, $(window).width(), $(window).height());
    canvasArray.push(exampleCanvas);

    backgroundCanvas = new CanvasElement("backgroundCanvas", 0, 0, $(window).width(), $(window).height());
    canvasArray.push(backgroundCanvas);

}

CanvasElement.prototype.clearCanvas = function () {

    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

};

var redraw = function () {

    var i;

    for (i = 0; i < destroyArray.length; i++) {
        destroyArray[i].body.DestroyBody();
    }

    for (i = 0; i < canvasArray.length; i++) {

        canvasArray[i].clearCanvas();

    }

    //redrawBackgrounds();

    for (var j = 0; j < gameElementsArray.length; j++) {

        var el = gameElementsArray[j];

        if (el.constructor == Sprite) {

            redrawSprite(el);
            el.executeBehaviours();

        }

        else if (el.constructor == Button) {

            el.targetCanvas.context.fillStyle = el.bgColour;
            el.targetCanvas.context.fillRect(el.x, el.y, el.width, el.height);

            el.targetCanvas.context.font = el.fontSize + "px " + el.fontType + "monospace";
            el.targetCanvas.context.fillStyle = el.fontColour;
            el.targetCanvas.context.fillText(el.text, el.x, el.y + el.height, el.width);
        }
    }

    for (var k = 0; k < spriteArray.length; k++) {
        spriteArray[k].executeBehaviours();
    }

    if (physicsEnabled) {
        physicsLoop();
        physics.debug();
    }
    checkPressedKeys();
    checkReleasedKeys();

    requestAnimationFrame(redraw);

    listen(redraw);

};

function physicsLoop() {

    var tm = new Date().getTime();

    var dt = (tm - lastFrame) / 1000;

    if (dt > 1 / 15) {
        dt = 1 / 15;
    }

    physics.step(dt);

    lastFrame = tm;

}

function redrawSprite(el) {

    if (el.rotation !== 0) {

        var halfWidth = el.width / 2;
        var halfHeight = el.height / 2;

        //console.log(el.rotation);
        el.targetCanvas.context.translate(el.x + halfWidth, el.y + halfHeight);
        el.targetCanvas.context.rotate(el.rotation);

        el.targetCanvas.context.drawImage(el.img, -halfWidth, -halfHeight, el.width, el.height);

        el.targetCanvas.context.rotate(-el.rotation);
        el.targetCanvas.context.translate(-(el.x + halfWidth), -(el.y + halfHeight));

    }

    else {
        el.targetCanvas.context.drawImage(el.img, el.x, el.y, el.width, el.height);
    }

}

function redrawBackgrounds() {

    for (var i = 0; i < backgroundsArray.length; i++) {

        var bg = backgroundsArray[i];

        if (backgroundsArray[i].colour) {
            backgroundCanvas.context.fillStyle = bg.colour;
            backgroundCanvas.context.fillRect(bg.x, bg.y, bg.width, bg.height);
        }

    }

}

function redrawButtons() {

    var button;

    for (var i = 0; i < buttonsArray.length; i++) {

        button = buttonsArray[i];

        button.targetCanvas.context.fillStyle = button.bgColour;
        button.targetCanvas.context.fillRect(button.x, button.y, button.width, button.height);

        button.targetCanvas.context.font = button.fontSize + "px " + button.fontType + "monospace";
        button.targetCanvas.context.fillStyle = button.fontColour;
        button.targetCanvas.context.fillText(button.text, button.x, button.y + button.height, button.width);

    }
}

//Other functions

//Font checker inspired by http://www.kirupa.com/html5/detect_whether_font_is_installed.htm
function doesFontExist(fontName) {

    var testCanvas = document.createElement("canvas");
    var testContext = testCanvas.getContext("2d");

    var text = "abcdefghijklmnopqrstuvwxyz0123456789";

    testContext.font = "20px monospace";
    var baselineSize = testContext.measureText(text).width;

    testContext.font = "20px '" + fontName + "', monospace";
    var newSize = testContext.measureText(text).width;

    testCanvas.remove();

    return (newSize !== baselineSize);

}

function imagesLoaded() {

    return true;

    var counter = 0;

    for (var i = 0; i < spriteArray.length; i++) {

        //spriteArray[i].img.onload = function () {

            counter++;
            if (counter == spriteArray.length) {
                console.log("ALL IMAGES LOADED");
                return true;
            }

        //}

    }
}

function readImage(targetImage){

    fileRead = new FileReader();
    fileRead.readAsDataURL(targetImage);
    fileRead.onload = function(){

        var tempImage = new Image();
        tempImage.src = fileRead.result;

        return tempImage;

    }

}

function showImage(){

    console.log(fileRead.result);

    var tempImage = new Image();
    tempImage.src = fileRead.result;

    return tempImage;

}

//Mouse and keyboard Functions

var mouseMoveListener = function (e) {

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    mouse.x = e.pageX;
    mouse.y = e.pageY;

    listen(mouseMoveListener);

};

function createMouseJoint(){

    var e = Event;


}

function listen(listeningFunction) {

    if (listeningFunction.functions) {
        for (var i = 0; i < listeningFunction.functions.length; i++) {
            listeningFunction.functions[i].apply(listeningFunction.functions[i].bodyObject, listeningFunction.functions[i].parameterArray);
        }
    }
    else{
        listeningFunction.functions = [];
    }

}

Body.prototype.addEvent = function (targetFunction, listener, parameterArray) {

    if (parameterArray && parameterArray.length > -1) {
        targetFunction.parameterArray = parameterArray;
    }
    else {
        targetFunction.parameterArray = [parameterArray];
    }

    targetFunction.bodyObject = this;

    if (!listener.functions) {
        listener.functions = [];
    }

    listener.functions.push(targetFunction);

};

//TO DO: Support for shift, enter etc.
Body.prototype.addKeyDownEvent = function (key, targetFunction, parameterArray) {
    controlArray.push(addKey.apply(this, [key, targetFunction, parameterArray]));
};

Body.prototype.addKeyUpEvent = function (key, targetFunction, parameterArray) {
    controlReleasedArray.push(addKey.apply(this, [key, targetFunction, parameterArray]));
};

function addKey(key, targetFunction, parameterArray) {

    var newKey = {};
    newKey.id = key;

    if (parameterArray && parameterArray.length > -1) {
        targetFunction.parameterArray = parameterArray;
    }
    else {
        targetFunction.parameterArray = [parameterArray];
    }

    targetFunction.bodyObject = this;

    var controlPos = controlArray.indexOf(newKey);

    if (controlPos == -1) {
        newKey.functions = [targetFunction];
    }
    else if (controlPos > -1) {
        newKey.functions.push(targetFunction);
    }

    return newKey;

}

document.onkeydown = function (e) {

    if (pressedKeysArray.indexOf(e.keyCode) == -1) {
        pressedKeysArray.push(e.keyCode);
    }

};

document.onkeyup = function (e) {
    pressedKeysArray.splice(pressedKeysArray.indexOf(e.keyCode), 1);
    releasedKeysArray.push(e.keyCode);
};

function checkPressedKeys() {
    checkKeys(pressedKeysArray, controlArray);
}

function checkReleasedKeys() {

    checkKeys(releasedKeysArray, controlReleasedArray);
    releasedKeysArray = [];

}

function checkKeys(actualKeys, keysToCheck) {

    var result = [];

    if (actualKeys.length > 0) {

        for (var i = 0; i < actualKeys.length; i++) {
            for (var k = 0; k < keysToCheck.length; k++) {
                if (actualKeys[i] == keysToCheck[k].id.toASCII()) {
                    result.push(keysToCheck[k]);
                }
            }
        }

        for (var j = 0; j < result.length; j++) {
            listen(result[j]);
        }

    }

}

//String functions

String.prototype.toASCII = function () {
    return this.toUpperCase().charCodeAt(0);
};

//Number Functions

function tanAngle(object1, object2) {

    var tanAngle = Math.atan2(object1.x - object2.x, object2.y - object1.y) - (Math.PI / 3);
    /*if (tanAngle < 0) {
     if (object1.y < object2.y) {
     tanAngle = ((3 * Math.PI) / 2) - Math.abs(tanAngle);
     }
     else {
     tanAngle = ((3 * Math.PI) / 2) + tanAngle;
     }
     }*/
    return tanAngle;
}

Body.prototype.inBounds = function (targetCanvas) {

    /*var xLeft = this.body.GetWorldCenter().x - this.body.GetRadius();
    var xRight = this.body.GetWorldCenter().x + this.body.GetRadius();
    var yLeft = this.body.GetWorldCenter().y - this.body.GetRadius();
    var yRight = this.body.GetWorldCenter().y + this.body.GetRadius();*/

    var boundsCheck = false;
    if(this.body.GetWorldCenter().x >= 0 && this.body.GetWorldCenter().x <= targetCanvas.width &&
        this.body.GetWorldCenter().y >= 0 && this.body.GetWorldCenter().y <= targetCanvas.height){
        boundsCheck = true;
    }

    /*if (this.width && this.height) {
        if ((xLeft >= 0) && (xRight <= targetCanvas.width) && (yLeft >= 0) && (yRight <= targetCanvas.height)) {
            boundsCheck = true;
        }
    }
    else if ((this.GetWorldCenter().x >= 0) && (this.GetWorldCenter().x <= targetCanvas.width) && (this.GetWorldCenter().y >= 0) && (this.GetWorldCenter().y <= targetCanvas.height)) {
        boundsCheck = true;
    }

    console.log(boundsCheck);*/
    return boundsCheck;

};