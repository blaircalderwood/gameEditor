var backgroundCanvas, mainCanvas,
    canvasElements = [], canvasRects = [],
    mouseDown = false,
    mouse = {
        x: 0,
        y: 0,
        oldX: 0,
        oldY: 0,
        events: [],
        elementName: "Mouse",
        availableEvents: [{elementName: "Left Mouse Down", targetFunction: ""}, {elementName: "Left Mouse Up", targetFunction: ""}]
    },
    keyboard = {events: [], elementName: "Keyboard", availableEvents: [{elementName: "Key Down", targetFunction: ""}, {elementName: "Key Up", targetFunction: ""}]},
    dragInterval, clickedElement,
    behaviourBarPos = -1,
    behaviours = {}, behaviourArray = [], plusImage, topMenu = "", menuShown = false,
    rightMenu, shownWindow,
    worldGravity = {horizontal: 0, vertical: 0.9},
    behavioursShown;

var compileText = "";

//Constructors

/** Creates a new rectangle on the canvas - usually to surround and highlight an element
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param targetCanvas
 * @param colour
 * @param type
 * @constructor
 */

function CanvasRectangle(x, y, width, height, targetCanvas, colour, type) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.targetCanvas = targetCanvas;
    this.colour = colour;
    this.type = type;

}

//Set Up

/** Loads all elements needed to run the editor
 *
 */

function loadInterface() {

    backgroundCanvas = document.getElementById("backgroundCanvas");
    backgroundCanvas.context = backgroundCanvas.getContext("2d");

    mainCanvas = document.getElementById("mainCanvas");
    mainCanvas.context = mainCanvas.getContext("2d");

    rightMenu = document.getElementById("rightClickMenu");

    resizeCanvas();

    setUpBackground();

    setInterval(redraw, 17);

    $(".UIWindow").resizable({handles: "n, e, s, w, ne, se, sw, nw"}).draggable();

    $("#behaviourDiv").hide();

    loadBehaviours();

}

/** Shows the File menu at the top left corner of the screen
 *
 */

function showFileMenu() {

    var menu = $("<ul id='menu'>" +
    "<li><a onmousedown='compile()'>Run</a></li>" +
    "<li>New Project</li>" +
    "<li>Settings</li>" +
    "</ul></div>");

    createMenu(menu, document.getElementById("fileMenuButton"));

}

/** Shows the edit menu next to the file menu
 *
 */

function showEditMenu() {

    var menu = $("<ul id='editMenu'>" +
    "<li><a>Edit Stuff</a></li>" +
    "<li>Change Stuff</li>" +
    "<li>Remove Stuff</li>" +
    "</ul></div>");

    createMenu(menu, document.getElementById("editMenuButton"));

}

/** Shows the corresponding file, edit or window menu upon click of the relevant button
 *
 * @param menu
 * @param menuButton
 */

function createMenu(menu, menuButton) {

    if (menuShown)removeTopMenu();

    var menuContainer = $("<div id='clickMenu' style='position: absolute; font-size: 14px; z-index: 100;'>").css({
        top: menuButton.getBoundingClientRect().bottom + 1 + "px",
        left: menuButton.getBoundingClientRect().left + "px"
    });

    menu.menu();
    menu.appendTo(menuContainer);
    menuContainer.appendTo("body");

    menuShown = true;

    topMenu = menu;

}

function showTopMenu(menuFunction, menuID) {

    if (!menuShown) {
        menuFunction();
    }
    else {
        removeTopMenu();
    }

}

function removeTopMenu() {

    topMenu.remove();
    topMenu = "";
    menuShown = false;

}

/** Change the canvas size to fit the width and height of the screen
 *
 */

function resizeCanvas() {

    backgroundCanvas.width = $(window).width();
    backgroundCanvas.height = $(window).height();

    mainCanvas.width = $(window).width() * 0.67;
    mainCanvas.height = $(window).height() * 0.67;

}

/** Change the colours of the canvas background
 *
 */

function setUpBackground() {

    backgroundCanvas.context.fillStyle = 'skyblue';
    backgroundCanvas.context.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    mainCanvas.context.fillStyle = 'white';
    mainCanvas.context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

}

/** Load the corresponding images for each behaviour in the Behaviour Bar
 *
 */

function loadBehaviours() {

    var elWidth = backgroundCanvas.width * 0.20;
    var elHeight = backgroundCanvas.height * 0.85;

    var turret = {};
    turret.image = new Image();
    turret.image.src = "../Images/turret.png";

    behaviours.turret = turret;

    plusImage = new Image();
    plusImage.src = "../Images/plusImage.png"

}

//General Functions

/** Redraw the screen every frame
 *
 */

function redraw() {

    var i = 0;
    var behaviourWidth = backgroundCanvas.width * 0.07;

    setUpBackground();

    var currentEl;

    for (i = 0; i < canvasElements.length; i++) {

        currentEl = canvasElements[i];

        if (currentEl.image.src) {
            canvasElements[i].targetCanvas.context.drawImage(currentEl.image, currentEl.x, currentEl.y, currentEl.width, currentEl.height);
        }

    }

    for (i = 0; i < canvasRects.length; i++) {

        if (canvasRects[i].type == "fill") {
            canvasRects[i].targetCanvas.context.fillStyle = canvasRects[i].colour;
            canvasRects[i].targetCanvas.context.fillRect(canvasRects[i].x, canvasRects[i].y, canvasRects[i].width, canvasRects[i].height);

        }

        else if (canvasRects[i].type == "stroke") {
            canvasRects[i].targetCanvas.context.strokeStyle = canvasRects[i].colour;
            canvasRects[i].targetCanvas.context.strokeRect(canvasRects[i].x, canvasRects[i].y, canvasRects[i].width, canvasRects[i].height);
        }

    }

    if (behaviourBarPos >= 0) {

        for (i = 0; i < behaviourArray.length; i++) {

            backgroundCanvas.context.drawImage(behaviourArray[i].image, (backgroundCanvas.width * 0.21) + (behaviourWidth * i),
                (backgroundCanvas.height * 0.86), behaviourWidth, behaviourWidth);

        }

        backgroundCanvas.context.drawImage(plusImage, (backgroundCanvas.width * 0.21) + (behaviourWidth * (i)),
            (backgroundCanvas.height * 0.86), behaviourWidth, behaviourWidth);

    }

}

/** Clear all canvases of any drawings
 *
 */

function clearCanvases() {

    backgroundCanvas.context.fillStyle = 'white';
    backgroundCanvas.context.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    mainCanvas.context.fillStyle = 'white';
    mainCanvas.context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

}

/** Save mouse coordinates every time it is moved
 *
 * @param e
 */

function mouseMoveListener(e) {

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    mouse.x = e.pageX;
    mouse.y = e.pageY;

    if (mouseDown && clickedElement !== undefined && dragging()) {
        clickedElement.dragElement();
    }

}

/** Check for clicked elements each time the mouse is pressed
 *
 * @param e
 */

function mouseDownListener(e) {

    mouse.startX = mouse.x;
    mouse.startY = mouse.y;

    var tempRect, tempX, tempY, targetElement;

    mouseDown = true;

    for (var i = 0; i < canvasElements.length; i++) {

        targetElement = canvasElements[i];

        tempRect = targetElement.targetCanvas.getBoundingClientRect();
        tempX = e.pageX - tempRect.left;
        tempY = e.pageY - tempRect.top;

        if (tempX >= targetElement.x && tempX <= (targetElement.x + targetElement.width) &&
            tempY >= targetElement.y && tempY <= (targetElement.x + targetElement.height)) {

            clickedElement = targetElement;

        }
        else if ($("#backgroundCanvas:hover").length > 0 || $("#mainCanvas:hover").length > 0) {
            targetElement.unHighlight();
        }

    }

    if ($("#clickMenu:hover").length > 0) {
        removeRightMenu();
    }

    if (menuShown)removeTopMenu();
}

/** Show the right click menu each time the right mouse button is pressed
 *
 */

$(document).bind("contextmenu", function (event) {

    event.preventDefault();

    removeRightMenu();

    var menu = $("<ul id='menu'>" +
    "<li><a onmousedown='showDrawPage()'> New Element</a></li>" +
    "<li>Edit</li>" +
    "<li>Delete</li>" +
    "</ul></div>");

    var rightMenu = $("<div id='clickMenu' style='position: absolute; font-size: 14px; z-index: 100;'>").css({
        top: event.pageY + "px",
        left: event.pageX + "px"
    });
    menu.menu();
    menu.appendTo(rightMenu);
    rightMenu.appendTo("body");

});

/**Remove the right click menu when the user clicks elsewhere on the screen
 *
 */

function removeRightMenu() {

    var clickMenu = $("#clickMenu");

    if (clickMenu) {
        clickMenu.remove();
    }

}

/** Drop any dragging elements when the mouse button is released
 *
 * @param e
 */

function mouseUpListener(e) {

    mouseDown = false;

    if (clickedElement !== undefined) {
        clickedElement.dropElement();
        clickedElement = undefined;
    }

}

/** Drag an element on screen
 *
 * @returns {boolean}
 */

function dragging() {

    return !(mouse.startX - mouse.x >= -3 && mouse.startX - mouse.x <= 3 &&
    mouse.startY - mouse.y >= -3 && mouse.startY - mouse.y <= 3);

}

/** Show window containing additional functionality e.g. Sprite Editor
 *
 * @param newShownWindow
 */

function showWidget(newShownWindow) {

    shownWindow = newShownWindow;
    newShownWindow.show();

    $(".closeButton").button({icons: {primary: "ui-icon-circle-close"}, text: false});

}

/** Close any additional windows
 *
 */

function closeWindow() {

    if (shownWindow) {
        shownWindow.hide();
        shownWindow = "";
    }

}

/** Load a drawing made in sprite editor via local storage
 *
 */

function loadCanvasDrawing() {

    if (sessionStorage.image) {
        var data = sessionStorage.getItem('image');

        var tempImage = new Image();
        tempImage.src = data;

        tempImage.onload = function () {
            canvasElements.push(new CanvasElement(mainCanvas.width / 2, mainCanvas.height / 2,
                tempImage.width, tempImage.height, mainCanvas, tempImage, null, true, true));
            generalFunctions.createList(canvasElements, $("#elementList"));
        };

        sessionStorage.removeItem('image');
    }

}

function loadSessDrawings() {

    if (sessionStorage.images) {
        //for (var i = 0; i <sessionStorage.images.length; i ++){
        var newImage = new Image();
        newImage.src = JSON.stringify(sessionStorage.images[0]);
        newImage.onload = function () {
            new CanvasElement(10, 10, 64, 64, mainCanvas, newImage);
            generalFunctions.createList(canvasElements, $("#elementList"));
        };
        //}
    }
}

/** Show dialog box when the user closes a window
 *
 */

function confirmCloseWindow() {

    $("#confirmDialog").dialog({
        buttons: {
            "Save": function () {
                loadCanvasDrawing();
                closeWindow();
                $(this).dialog("close");
            },
            "Delete": function () {
                closeWindow();
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    })
}

/** Compile all features set by the user into a local storage file ready to be run by the game engine as a full game
 *
 */

function compile() {

    var canImage;

    compileText = "var firstBody;" +
    "physics.world.SetGravity(new b2Vec2(" + worldGravity.horizontal + ", " + worldGravity.vertical + "));";

    for (var i = 0; i < canvasElements.length; i++) {

        compileText += "firstBody = new Body(physics, {" +
        "shape: 'circle'," +
        "radius: " + (canvasElements[i].width / 2) + "/ physics.scale," +
        "x:  " + (canvasElements[i].x + (canvasElements[i].width / 2)) + "/ physics.scale," +
        "y: " + (canvasElements[i].y + (canvasElements[i].height / 2)) + "/ physics.scale," +
        "width: " + canvasElements[i].width + "/ physics.scale," +
        "height: " + canvasElements[i].height + "/ physics.scale," +
        "image: '" + canvasElements[i].image.src + "'});" +
        //"image: 'exampleImage.png'});" +
        "spriteArray.push(firstBody);";

    }

    compileText += "startEngine();";

    console.log(compileText);

    localStorage.setItem('compiledText', compileText);

    window.open("../Engine/index.html");

}

/** Add a new event to manipulate a game element e.g. move up on key press
 *
 */

function addNewEvent() {

    console.log("ADDING EVENT!");

}

/** Show the event creation page
 *
 * @param eventTargets
 */

function showEventsPage(eventTargets) {
    
    generalFunctions.createList(eventTargets, $("#addEventElement"));

    showWidget($('#eventCreatorDiv'));

}

/** Show the events that can be executed upon satisfaction of a particular condition
 *
 */

function showExecutorEvents(){

    console.log("Executor has been clicked");

}

/** Show the page that holds all executor events
 *
 * @param eventTargets
 */

function showExecutorPage(eventTargets){

    $("#addEventElement").empty();
    $("#addEventTask").empty();

    generalFunctions.createList(eventTargets, $("#addEventElement"));
    console.log(eventTargets);

}

/** Show events that can act as listeners in order to carry out a certain task
 *
 * @param onClickFunction
 * @param callback
 * @param genericElements
 */

function eventElementsList(onClickFunction, callback, genericElements){

    var targetList = [];

    if (genericElements) {

        targetList.push(mouse, keyboard);
        for (var j = 0; j < targetList.length; j++)targetList[j].elementClicked = onClickFunction;

    }

    for (var i = 0; i < canvasElements.length; i++){
        targetList.push(canvasElements[i]);
    }
    for(var k = 2; k <targetList.length; k ++)targetList[k].elementClicked = onClickFunction;
    
    if(callback)callback(targetList);
    
}

/** Show Sprite Editor window
 *
 */

function showDrawPage() {
    showWidget($("#drawDiv"));
}

/** Show events of each object that can be listened upon
 *
 */

function showTargetEvents() {

    for (var i = 0; i < this.availableEvents.length; i ++){

        this.availableEvents[i].elementClicked = function(){

            eventElementsList(showExecutorEvents, showExecutorPage, false);

        };

    }

    generalFunctions.createList(this.availableEvents, $("#addEventTask"));

}