var gameElementsArray = [], buttonsArray = [], textArray = [], backgroundsArray = [], canvasArray = [], spriteArray = [],
    eventsArray = [], pressedKeysArray = [], releasedKeysArray = [], destroyArray = [], controlArray = [], gamepadArray = [],
    controlReleasedArray = [], FPS = [], FPSAverage = [], FPSTimer, FPSIterations = 0, frameCounter = 0;
var exampleCanvas, backgroundCanvas, physicsCanvas, gamepadConnected = false;
var mouse = {x: 0, y: 0, width: 10, height: 10, savedX: -1, savedY: -1}, mouseBody;
var physics;
var lastFrame = new Date().getTime();
var physicsEnabled = true, engineStarted = false;
var fileRead;

//Constructor Functions

/** Creates a new keyboard key binding which will execute the target function when pressed
 *
 * @param control
 * @param targetFunction
 * @constructor
 */

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

/** Creates an in-game button which can be clicked by an end user
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param zIndex
 * @param targetCanvas
 * @param targetFunction
 * @param text
 * @param bgColour
 * @param fontType
 * @param fontSize
 * @param fontColour
 * @constructor
 */

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

/** Alters the game background to display an image or colour
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param zIndex
 * @param img
 * @param colour
 * @constructor
 */

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

/** Creates a new in-game element which can be altered programatically
 *
 * @param DOMElement
 * @param x
 * @param y
 * @param width
 * @param height
 * @constructor
 */

function CanvasElement(DOMElement, x, y, width, height) {

    this.canvas = document.getElementById(DOMElement);
    this.context = this.canvas.getContext("2d");
    this.canvas.x = x;
    this.canvas.y = y;
    this.canvas.width = width;
    this.canvas.height = height;

}

/** Called when the document is loaded
 *
 */

window.onload = function () {

    setUpCanvases();

    if (physicsEnabled) physics = window.physics = new Physics(physicsCanvas.canvas, 20);

    //engineReady(physics);

    var tempText = localStorage.getItem('compiledText');
    eval(tempText);

    imagesLoaded();

    FPSTimer = setInterval(function(){

        FPSIterations ++;

        FPSAverage.push(frameCounter);
        frameCounter = 0;

        if(FPSIterations >= 30){
         //console.log(FPSAverage);
         FPSIterations = 0;
         }

    }, 1000);

    if(navigator.getGamepads()[0])gamepadConnected = true;

    redraw();

};

/** Starts the execution of the game engine
 *
 */

var startEngine = function() {

    createMouseJoint();

    engineStarted = true;

    listen(startEngine);

    physics.collision();
    physics.click();

};

/** Loads all required canvases from DOM for future manipulation
 *
 */

function setUpCanvases() {

    physicsCanvas = new CanvasElement("physicsCanvas", 0, 0, 1280, 682);
    exampleCanvas = new CanvasElement("exampleCanvas", 0, 0,  1280, 682);
    canvasArray.push(exampleCanvas);

    backgroundCanvas = new CanvasElement("backgroundCanvas", 0, 0, $(window).width(), $(window).height());
    canvasArray.push(backgroundCanvas);

}

/** Removes everything drawn to a canvas
 *
 */

CanvasElement.prototype.clearCanvas = function () {

    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

};

/** Called every frame to redraw any altered canvas elements and check for any event listener changes
 *
 */

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
        //physics.debug();
    }
    checkPressedKeys();
    checkReleasedKeys();

    if(gamepadConnected)checkGamepadKeys();

    listen(redraw);

    requestAnimationFrame(redraw);

};

/** Called every frame to run the in game physics
 *
 */

function physicsLoop() {

    var tm = new Date().getTime();

    var dt = (tm - lastFrame) / 1000;

    if (dt > 1 / 15) {
        dt = 1 / 15;
    }

    physics.step(dt);

    lastFrame = tm;

    frameCounter ++;

}

/** Redraw a canvas element
 *
 * @param el
 */

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

/** Redraw all backgrounds
 *
 */

function redrawBackgrounds() {

    for (var i = 0; i < backgroundsArray.length; i++) {

        var bg = backgroundsArray[i];

        if (backgroundsArray[i].colour) {
            backgroundCanvas.context.fillStyle = bg.colour;
            backgroundCanvas.context.fillRect(bg.x, bg.y, bg.width, bg.height);
        }

    }

}

/** Redraw all buttons
 *
 */

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
/** Check if a chosen font is available for use on the client's device
 *
 * @param fontName
 * @returns {boolean}
 */

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

/** Load all required images
 *
 * @returns {boolean}
 */

function imagesLoaded() {

    var counter = 0;
    var newImage = [];

    for (var i = 0; i < spriteArray.length; i++) {

        newImage[i] = spriteArray[i].details.image;

        //generalFunctions.loadImages(finishedImageLoad, null, newImage);

        finishedImageLoad(newImage);
        spriteArray[i].details.image.onload = function () {

            counter++;
            if (counter >= spriteArray.length - 1) {
                console.log("ALL IMAGES LOADED");
                return true;
            }

        }

    }
}

function finishedImageLoad(images) {

    for (var i = 0; i < images.length; i++) {

        //spriteArray[i].details.image = images[i];

        spriteArray[i].details.image = new Image();
        spriteArray[i].details.image.src = images[i];

        spriteArray[0].details.image.onload = function () {
            startEngine();
        }(i);

    }

}
/** Load any data url images
 *
 * @param targetImage
 */

function readImage(targetImage) {

    fileRead = new FileReader();
    fileRead.readAsDataURL(targetImage);
    fileRead.onload = function () {

        var tempImage = new Image();
        tempImage.src = fileRead.result;

        return tempImage;

    }

}

/** Show data url image
 *
 * @returns {Image}
 */

function showImage() {

    console.log(fileRead.result);

    var tempImage = new Image();
    tempImage.src = fileRead.result;

    return tempImage;

}

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

/** Execute all associated functions when a particular event happens
 *
 * @param listeningFunction
 */

function listen(listeningFunction) {

    if (listeningFunction.functions) {
        for (var i = 0; i < listeningFunction.functions.length; i++) {
            listeningFunction.functions[i].apply(listeningFunction.elements[i], listeningFunction.functions[i].parameterArray);
            //listeningFunction.functions[i](listeningFunction.functions[i].parameterArray);
        }
    }

}

/** Add an event to an in game object. This event will execute a given function when certain criteria is satisfied (e.g. a mouse click)
 *
 * @param targetFunction
 * @param listener
 * @param parameterArray
 */

Body.prototype.addEvent = function (targetFunction, listener, parameterArray) {

    var newFunction = eval("this." + targetFunction);
    console.log(newFunction);
    if (parameterArray && parameterArray.length > -1) {
        newFunction.parameterArray = parameterArray;
    }
    else {
        newFunction.parameterArray = [parameterArray];
    }

    newFunction.listener = listener;
    newFunction.functionName = targetFunction;
    newFunction.bodyObject = this;

    if (listener.functions == undefined) {
        listener.functions = [];
        listener.elements = [];
    }

    listener.functions.push(newFunction);
    listener.elements.push(this);

    eventsArray.push(newFunction);
    var arrayIndex = spriteArray.indexOf(this);

    if(spriteArray[arrayIndex].functions == undefined) spriteArray[arrayIndex].functions = [];

    spriteArray[arrayIndex].functions.push(newFunction);

};

//TO DO: Support for shift, enter etc.

/** Add an event that is trigger when a keyboard key is pressed
 *
 * @param key
 * @param targetFunction
 * @param parameterArray
 */

Body.prototype.addKeyDownEvent = function (key, targetFunction, parameterArray) {

    var newFunction = addKey.apply(this, [key, targetFunction, parameterArray, controlArray]);

    controlArray.push(newFunction);

};

/** Add an event that is triggered when a keyboard key is released
 *
 * @param key
 * @param targetFunction
 * @param parameterArray
 */

Body.prototype.addKeyUpEvent = function (key, targetFunction, parameterArray) {
    controlReleasedArray.push(addKey.apply(this, [key, targetFunction, parameterArray, controlArray]));
};

Body.prototype.addCollisionEvent = function(targetFunction, parameterArray){

    var newFunction = eval("this." + targetFunction);

    if(!Array.isArray(parameterArray))parameterArray = [parameterArray];
    console.log(parameterArray);

    this.collisionArray.push({collidingObject: parameterArray[0], targetFunction: newFunction});

    //parameterArray.splice(0, 1);

    this.collisionArray.parameterArray = parameterArray;

    newFunction.functionName = targetFunction;

    eventsArray.push(newFunction);

};

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

    if (pressedKeysArray.indexOf(e.keyCode) == -1) {
        pressedKeysArray.push(e.keyCode);
    }

};

/** Remove key from event testing array when is it released
 *
 * @param e
 */

document.onkeyup = function (e) {
    pressedKeysArray.splice(pressedKeysArray.indexOf(e.keyCode), 1);
    releasedKeysArray.push(e.keyCode);
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

//String functions

/** Returns an ASCII value when given a keyboard key
 *
 * @returns {number}
 */

String.prototype.toASCII = function () {
    return this.toUpperCase().charCodeAt(0);
};

//Number Functions

/** Returns the tangent between two objects
 *
 * @param object1
 * @param object2
 * @returns {number}
 */

function tanAngle(object1, object2) {

    return Math.atan2(object1.x - object2.x, object2.y - object1.y) - (Math.PI / 3);

}

/** Check if a given object is currently within the bounds of the canvas
 *
 * @param targetCanvas
 * @returns {boolean}
 */

Body.prototype.inBounds = function (targetCanvas) {

    /*var xLeft = this.body.GetWorldCenter().x - this.body.GetRadius();
     var xRight = this.body.GetWorldCenter().x + this.body.GetRadius();
     var yLeft = this.body.GetWorldCenter().y - this.body.GetRadius();
     var yRight = this.body.GetWorldCenter().y + this.body.GetRadius();*/

    var boundsCheck = false;
    if (this.body.GetWorldCenter().x >= 0 && this.body.GetWorldCenter().x <= targetCanvas.width &&
        this.body.GetWorldCenter().y >= 0 && this.body.GetWorldCenter().y <= targetCanvas.height) {
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