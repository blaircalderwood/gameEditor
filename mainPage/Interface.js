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

function showFileMenu() {

    var menu = $("<ul id='menu'>" +
    "<li><a onmousedown='compile()'>Run</a></li>" +
    "<li>New Project</li>" +
    "<li>Settings</li>" +
    "</ul></div>");

    createMenu(menu, document.getElementById("fileMenuButton"));

}

function showEditMenu() {

    var menu = $("<ul id='editMenu'>" +
    "<li><a>Edit Stuff</a></li>" +
    "<li>Change Stuff</li>" +
    "<li>Remove Stuff</li>" +
    "</ul></div>");

    createMenu(menu, document.getElementById("editMenuButton"));

}

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

function resizeCanvas() {

    backgroundCanvas.width = $(window).width();
    backgroundCanvas.height = $(window).height();

    mainCanvas.width = $(window).width() * 0.67;
    mainCanvas.height = $(window).height() * 0.67;

}

function setUpBackground() {

    backgroundCanvas.context.fillStyle = 'skyblue';
    backgroundCanvas.context.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    mainCanvas.context.fillStyle = 'white';
    mainCanvas.context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

}

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

function clearCanvases() {

    backgroundCanvas.context.fillStyle = 'white';
    backgroundCanvas.context.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    mainCanvas.context.fillStyle = 'white';
    mainCanvas.context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

}

function mouseMoveListener(e) {

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    mouse.x = e.pageX;
    mouse.y = e.pageY;

    if (mouseDown && clickedElement !== undefined && dragging()) {
        clickedElement.dragElement();
    }

}

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

function removeRightMenu() {

    var clickMenu = $("#clickMenu");

    if (clickMenu) {
        clickMenu.remove();
    }

}

function mouseUpListener(e) {

    mouseDown = false;

    if (clickedElement !== undefined) {
        clickedElement.dropElement();
        clickedElement = undefined;
    }

}

function dragging() {

    return !(mouse.startX - mouse.x >= -3 && mouse.startX - mouse.x <= 3 &&
    mouse.startY - mouse.y >= -3 && mouse.startY - mouse.y <= 3);

}

//Create HTML to show the selected list
function createList(array, listElement) {

    //Delete anything that is currently in the list
    listElement.empty();

    //Loop for every item in the list
    for (var i = 0; i < array.length; i++) {

        //Create a new list item
        var listItem = document.createElement("li"),

        //Add an anchor containing the location name which will in future link to the relevant weather data
            anchor = document.createElement("a");
        anchor.innerText = array[i].elementName;

        //Add the list item to the page's HTML
        listItem.appendChild(anchor);
        listElement.append(listItem);

        (function (el) {
            listItem.onclick = function () {
                console.log(el);
                canvasElements[el].elementClicked();
            };
        })(i);

    }

    //If there is already a list then refresh it if no make a new one
    if (listElement.hasClass('ui-listview')) {
        listElement.listview('refresh');
    }
    else {
        listElement.trigger('create');
    }

}

function showWidget(newShownWindow) {

    shownWindow = newShownWindow;
    newShownWindow.show();

    $(".closeButton").button({icons: {primary: "ui-icon-circle-close"}, text: false});

}

function closeWindow() {

    if (shownWindow) {
        shownWindow.hide();
        shownWindow = "";
    }

}

function loadCanvasDrawing() {

    if (sessionStorage.image) {
        var data = sessionStorage.getItem('image');

        var tempImage = new Image();
        tempImage.src = data;
        console.log(tempImage);
        tempImage.onload = function () {
            canvasElements.push(new CanvasElement(mainCanvas.width / 2, mainCanvas.height / 2,
                tempImage.width, tempImage.height, mainCanvas, tempImage, null, true, true));
            createList(canvasElements, $("#elementList"));
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
            createList(canvasElements, $("#elementList"));
        };
        //}
    }
}

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

function addNewEvent() {

    console.log("ADDING EVENT!");

}

function showEventsPage() {

    var eventTargets = [];
    eventTargets.push(mouse, keyboard);
    for (var j = 0; j < eventTargets.length; j++)eventTargets[j].elementClicked = showTargetEvents;

    for (var i = 0; i < canvasElements.length; i++){
        eventTargets.push(canvasElements[i]);
    }
    for(var k = 2; k <eventTargets.length; k ++)eventTargets[k].elementClicked = showTargetEvents;

    generalFunctions.createList(eventTargets, $("#addEventElement"));

    showWidget($('#eventCreatorDiv'));

}

function showDrawPage() {
    showWidget($("#drawDiv"));
}

function showTargetEvents() {
    console.log(this.availableEvents);
    generalFunctions.createList(this.availableEvents, $("#addEventTask"));
}