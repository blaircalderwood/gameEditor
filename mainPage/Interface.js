var backgroundCanvas, mainCanvas,
    canvasElements = [], canvasRects = [], eventsList = [],
    mouseDown = false,
    mouse = {
        x: 0,
        y: 0,
        oldX: 0,
        oldY: 0,
        events: [],
        elementName: "Mouse",
        listenerEvents: [
            {elementName: "Left Mouse Down", targetFunction: "mousePressed"},
            {elementName: "Left Mouse Up", targetFunction: "mouseRelease"},
            {elementName: "Left Mouse Click", targetFunction: "mouseClick"},
            {elementName: "Move", targetFunction: "mouseMoveListener"}
        ]
    },
    keyboard = {
        events: [], elementName: "Keyboard", listenerEvents: [
            {elementName: "Key Down", targetFunction: "keyDown", parameters: [{label: "Key", inputType: "keyList"}]},
            {elementName: "Key Up", targetFunction: "keyUp", parameters: [{label: "Key", inputType: "keyList"}]}
        ]
    },
    system = {
        events: [], elementName: "System", listenerEvents: [
            {elementName: "Redraw", targetFunction: "redraw"},
            {elementName: "Game Loaded", targetFunction: "startEngine"}
        ]
    },
    dragInterval, clickedElement,
    behaviourBarPos = -1,
    behaviours = {}, behaviourArray = [], plusImage, topMenu = "", menuShown = false,
    rightMenu, shownWindow, selectedElNo,
    worldGravity = {horizontal: 0, vertical: 0},
    behavioursShown, eventCompiler = {eventListener: {}, eventExecutor: {}};

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

    var UIWindow = $(".UIWindow");

    UIWindow.resizable({handles: "n, e, s, w, ne, se, sw, nw"}).draggable();

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
            selectedElNo = i;
        }
        else if ($("#backgroundCanvas:hover").length > 0 || $("#mainCanvas:hover").length > 0) {
            targetElement.unHighlight();
            selectedElNo = -1;
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
            createList(canvasElements, $("#elementList"));
        };

        sessionStorage.removeItem('image');
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

    compileText = "var firstBody;";

    for (var i = 0; i < canvasElements.length; i++) {

        compileText += "firstBody = new Body(physics, {" +
        "shape: 'circle'," +
        "radius: " + (canvasElements[i].width / 2) + "/ physics.scale," +
        "x:  " + (canvasElements[i].x + (canvasElements[i].width / 2)) + "/ physics.scale," +
        "y: " + (canvasElements[i].y + (canvasElements[i].height / 2)) + "/ physics.scale," +
        "width: " + canvasElements[i].width + "/ physics.scale," +
        "height: " + canvasElements[i].height + "/ physics.scale," +
        "image: '" + canvasElements[i].image.src + "'});" +
        "spriteArray.push(firstBody);" +
        "physics.world.SetGravity(new b2Vec2(" + worldGravity.horizontal + ", " + worldGravity.vertical + "));";

        for (var j = 0; j < canvasElements[i].addedEvents.length; j++) {

            compileText += canvasElements[i].addedEvents[j];
        }

    }

    compileText += "startEngine();";

    console.log(compileText);

    localStorage.setItem('compiledText', compileText);

    window.open("../Engine/index.html");

}

/** Show Sprite Editor window
 *
 */

function showDrawPage() {

    showWidget($("#drawDiv"));

}

/** Show events that can act as listeners in order to carry out a certain task
 *
 * @param array
 * @param onClickFunction
 * @param showGenerics
 * @returns {Array}
 */

function eventElementsList(array, onClickFunction, showGenerics) {

    var targetList = [];

    var j = 0;

    if (showGenerics == true) {

        targetList.push(mouse, keyboard, system);
        for (j = 0; j < targetList.length; j++) {
            targetList[j].elementClicked = onClickFunction;
        }

    }

    for (var i = 0; i < array.length; i++) {
        targetList.push(array[i]);
        targetList[i].arrayIndex = i;
    }

    //k = j tests for insertion of generic elements (mouse, keyboard etc.)

    for (var k = j; k < targetList.length; k++) {

        targetList[k].elementClicked = onClickFunction;

    }

    return targetList;

}

function showListenerElements() {

    showWidget($("#eventCreatorDiv"));
    createList(eventElementsList(canvasElements, showListenerTasks, true), $("#addEventListener"));

}

function showListenerTasks() {

    eventCompiler.listenerElement = this;
    createList(eventElementsList(this.listenerEvents, showExecutorElements, false), $("#addEventTask"));

}

function showExecutorElements() {

    eventCompiler.eventListener = this;

    $("#addEventTask").empty();
    createList(eventElementsList(canvasElements, showExecutorTasks, false), $("#addEventListener"));

}

function showExecutorTasks() {

    eventCompiler.arrayIndex = this.arrayIndex;
    createList(eventElementsList(this.executorEvents, compileEvent, false), $("#addEventTask"));

}

function compileEvent() {

    if (!this.parametersDetails) {
        this.parametersDetails = [];
        this.parametersDetails[0] = "";
    }
    var i = eventCompiler.arrayIndex;

    eventCompiler.parameterArray = 10;

    eventCompiler.eventExecutor = this.engineFunction;

    var newEvent = "spriteArray[" + i + "].";

    if (eventCompiler.listenerElement.elementName == "Keyboard") {
        newEvent += "addKeyDownEvent('" + eventCompiler.eventListener.parametersDetails[0] + "', spriteArray[" + i + "]." + this.engineFunction;
        eventCompiler.eventListener.parametersDetails.splice(0, 1);
    }
    else newEvent += "addEvent(spriteArray[" + i + "]." + this.engineFunction + ", " + eventCompiler.eventListener.targetFunction;

    if (this.parametersDetails[0])newEvent += ", " + this.parametersDetails[0];

    newEvent += ");";
    canvasElements[i].addedEvents.push(newEvent);
    console.log(canvasElements[i].addedEvents);

    var eventString = {};

    eventString.elementName = "On " + eventCompiler.listenerElement.elementName + " " + eventCompiler.eventListener.elementName + " - " + eventCompiler.eventExecutor + " on " + canvasElements[eventCompiler.arrayIndex].elementName;

    eventString.elementClicked = function () {
        console.log("Event Clicked");
    };

    updateEventList(eventString);

    closeWindow();

}

function updateEventList(newEventString) {

    eventsList.push(newEventString);

    createList(eventsList, $("#eventsList"));

}

function checkShortcuts(e) {

    if (e.keyCode == 46 && selectedElNo >= 0) {
        canvasElements[selectedElNo].deleteElement();
    }
}

createList = function (array, JQMListElement, callback, callbackParamArray) {

    JQMListElement.empty();

    for (var i = 0; i < array.length; i++) {

        var listItem = document.createElement("li");

        if (!array[i].parameters) {

            var anchor = document.createElement("a");
            if (array[i].elementName) anchor.innerText = array[i].elementName;
            else console.log("Create List - Element Name not found for array object " + i);

            listItem.appendChild(anchor);
            JQMListElement.append(listItem);

            (function (el) {
                listItem.onclick = function () {
                    if (array[el].elementClicked)array[el].elementClicked();
                    else console.log("Create List - Element does not have clicked function");
                };
            })(i);

        }

        else {

            var collapsibles = [];

            var divItem = document.createElement("div");

            var ul = document.createElement("ul");

            var anchor1 = document.createElement("h4");

            var submitLi = document.createElement("li");
            var submitButton = document.createElement("a");
            $(submitButton).attr("data-type", "button");
            submitButton.innerText = "Submit";
            $(submitButton).button();

            if (array[i].elementName) anchor1.innerText = array[i].elementName;
            else console.log("Create List - Element Name not found for array object " + i);

            divItem.appendChild(anchor1);

            for (var z = 0; z < array[i].parameters.length; z++) {

                var parameterItem = array[i].parameters[z];

                var collapsibleItem = document.createElement("li");

                var collapsibleInput;

                if (parameterItem.inputType == "list") {

                    collapsibleInput = insertList(parameterItem);

                }

                else if (parameterItem.inputType == "canvasElements") {

                    parameterItem.inputList = fillCanvasElements();
                    collapsibleInput = insertElementsList();
                }

                else if (parameterItem.inputType == "keyList") {

                    parameterItem.inputList = fillKeys();
                    collapsibleInput = insertList(parameterItem);
                }

                else {

                    collapsibleInput = document.createElement("input");
                    if (parameterItem.inputType)collapsibleInput.type = parameterItem.inputType;

                }

                var collapsibleLabel = document.createElement("label");
                collapsibleLabel.innerHTML = parameterItem.label;

                collapsibleItem.appendChild(collapsibleLabel);
                collapsibleItem.appendChild(collapsibleInput);

                ul.appendChild(collapsibleItem);

                collapsibles.push(collapsibleInput);

            }

            (function (el, collapsibles) {

                submitButton.onclick = function () {

                    var parametersDetails = [];

                    for (var y = 0; y < collapsibles.length; y++) {
                        console.log(collapsibles[y].value);
                        parametersDetails[y] = collapsibles[y].value;
                    }
                    array[el].parametersDetails = parametersDetails;
                    console.log(array[el]);
                    if (array[el].elementClicked)array[el].elementClicked();
                    else console.log("Create List - Element does not have clicked function");

                };
            })(i, collapsibles);


            submitLi.appendChild(submitButton);

            ul.appendChild(submitLi);

            divItem.appendChild(ul);
            refreshList($(ul));
            listItem.appendChild(divItem);

            $(divItem).attr("data-role", "collapsible");
            $(divItem).attr("data-inset", false);
            $(divItem).collapsible();

            JQMListElement.append(listItem);

        }

    }

    refreshList(JQMListElement);

    if (callback)execCallback(callback, callbackParamArray);
    else return callbackParamArray;

};

function fillCanvasElements() {

    var targetArray = [];

    for (var q = 0; q < canvasElements.length; q++)targetArray.push(canvasElements[q].elementName);

    return targetArray;

}

function fillKeys() {
    return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
        "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
}

function insertList(target) {

    var collapsibleInput;

    collapsibleInput = document.createElement("select");
    if (target.inputList) {

        for (var i = 0; i < target.inputList.length; i++) {

            var option = document.createElement("option");
            option.innerHTML = option.value = option.title = target.inputList[i];
            collapsibleInput.appendChild(option);
        }
    }

    return collapsibleInput;

}

function insertElementsList() {

    var target = fillCanvasElements();
    var collapsibleInput;

    collapsibleInput = document.createElement("select");

    for (var i = 0; i < target.length; i++) {

        var option = document.createElement("option");
        option.innerHTML = option.title = target[i];
        option.value = "spriteArray[" + i + "]";
        collapsibleInput.appendChild(option);
    }

    return collapsibleInput;

}