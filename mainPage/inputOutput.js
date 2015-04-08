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
