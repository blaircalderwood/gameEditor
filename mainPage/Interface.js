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

var genericsArray = [mouse, keyboard, system];

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

    showWorldSettings();
    $("#elementSettingsButton").addClass('ui-disabled');

}

function showWorldSettings(){

    $("#worldSettingsButton").addClass('ui-btn-active');
    $("#elementSettings").hide();
    $("#worldSettings").show();

}

function showElementSettings(){

    $("#elementSettings").show();
    $("#worldSettings").hide();

}

function changeType(){

    if($("#staticCheck").is(":checked") == true) canvasElements[selectedElNo].type = "static";
    else canvasElements[selectedElNo].type = "dynamic";
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

/** Show dialog box when the user closes a window
 *
 */

function confirmCloseWindow() {

    $("#confirmDialog").dialog({
        buttons: {
            "Save": function () {
                closeWindow();
                $(this).dialog("close");
                renameSprite();
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

/** Show Sprite Editor window
 *
 */

function showDrawPage() {

    showWidget($("#drawDiv"));

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