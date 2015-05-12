var gameElementsArray = [], canvasArray = [], spriteArray = [],
    eventsArray = [], pressedKeysArray = [], releasedKeysArray = [], destroyArray = [], controlArray = [], gamepadArray = [],
    controlReleasedArray = [];
var exampleCanvas, backgroundCanvas, physicsCanvas, gamepadConnected = false;
var mouse = {x: 0, y: 0, width: 10, height: 10, savedX: -1, savedY: -1}, bulletImage;
var physics;
var lastFrame = new Date().getTime();
var physicsEnabled = true, engineStarted = false;

var FPS = {average: [], iterations: 0, recording: false, frameCounter: 0};

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

    var tempText = localStorage.getItem('compiledText');
    eval(tempText);

    imagesLoaded();

    if (navigator.getGamepads()[0])gamepadConnected = true;

    redraw();

};

FPS.recordFPS = function (repeat) {

    this.recording = true;

    this.timer = setInterval(function () {

        FPS.iterations++;

        FPS.average.push(FPS.frameCounter);
        FPS.frameCounter = 0;

        if (FPS.iterations >= 30) {
            console.log(FPS.average);
            FPS.iterations = 0;
            if (!repeat)clearInterval(FPS.timer);
        }

    }, 1000);

};

/** Starts the execution of the game engine
 *
 */

var startEngine = function () {

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
    exampleCanvas = new CanvasElement("exampleCanvas", 0, 0, 1280, 682);
    canvasArray.push(exampleCanvas);

    backgroundCanvas = new CanvasElement("backgroundCanvas", 0, 0, $(window).width(), $(window).height());
    canvasArray.push(backgroundCanvas);

}

/** Called every frame to redraw any altered canvas elements and check for any event listener changes
 *
 */

var redraw = function () {

    var i;

    for (i = 0; i < destroyArray.length; i++) {
        destroyArray[i].body.DestroyBody();
    }

    if (physicsEnabled) physicsLoop();


    checkPressedKeys();
    checkReleasedKeys();

    if (gamepadConnected)checkGamepadKeys();

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

    if (FPS.recording) FPS.frameCounter++;

}

/** Load all required images
 *
 * @returns {boolean}
 */

function imagesLoaded() {

    var counter = 0;
    var newImage = [];

    bulletImage = new Image();
    bulletImage.src = "../Images/bullet.png";

    bulletImage.onload = function () {
        console.log("Bullet Loaded");
        counter++;
    };

    for (var i = 0; i < spriteArray.length; i++) {

        newImage[i] = spriteArray[i].details.image;

        //generalFunctions.loadImages(finishedImageLoad, null, newImage);

        finishedImageLoad(newImage);
        spriteArray[i].details.image.onload = function () {

            counter++;
            if (counter >= spriteArray.length) {
                console.log("ALL IMAGES LOADED");
                return true;
            }

        }

    }
}

function finishedImageLoad(images) {

    for (var i = 0; i < images.length; i++) {

        spriteArray[i].details.image = new Image();
        spriteArray[i].details.image.src = images[i];

        spriteArray[0].details.image.onload = function () {
            startEngine();
        }(i);

    }

}

/** Execute all associated functions when a particular event happens
 *
 * @param listeningFunction
 */

function listen(listeningFunction) {

    if (listeningFunction.functions) {
        for (var i = 0; i < listeningFunction.functions.length; i++) {
            listeningFunction.functions[i].apply(listeningFunction.elements[i], [listeningFunction.functions[i].parameterArray]);
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

    console.log(this);
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

    if (spriteArray[arrayIndex].functions == undefined) spriteArray[arrayIndex].functions = [];

    if (listener == this.contact) {
        if (!spriteArray[arrayIndex].contactFunctions) spriteArray[arrayIndex].contactFunctions = [];
        spriteArray[arrayIndex].contactFunctions.push(newFunction);
    }

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

Body.prototype.addCollisionEvent = function (targetFunction, parameterArray) {

    var newFunction = eval("this." + targetFunction);

    if (!Array.isArray(parameterArray))parameterArray = [parameterArray];
    console.log(parameterArray);

    this.collisionArray.push({collidingObject: parameterArray[0], targetFunction: newFunction});

    //parameterArray.splice(0, 1);

    this.collisionArray.parameterArray = parameterArray;

    newFunction.functionName = targetFunction;

    eventsArray.push(newFunction);

};

/** Check if a given object is currently within the bounds of the canvas
 *
 * @param targetCanvas
 * @returns {boolean}
 */

Body.prototype.inBounds = function (targetCanvas) {

    var boundsCheck = false;
    if (this.body.GetWorldCenter().x >= 0 && this.body.GetWorldCenter().x <= targetCanvas.width &&
        this.body.GetWorldCenter().y >= 0 && this.body.GetWorldCenter().y <= targetCanvas.height) {
        boundsCheck = true;
    }

    return boundsCheck;

};