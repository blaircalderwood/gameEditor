var spriteExecutors = [
    {elementName: "Stop", engineFunction: "stop"},
    {elementName: "Move Left", engineFunction: "moveLeft", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Move Right", engineFunction: "moveRight", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Move Up", engineFunction: "moveUp", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Move Down", engineFunction: "moveDown", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Rotate Towards Mouse", engineFunction: "rotateTowardsMouse"},
    {elementName: "Rotate Towards Object", engineFunction: "rotateTowardsPoint", parameters: [
        {label: "Target Object", inputType: "canvasElements"}
    ]},
    {elementName: "Move Towards Mouse", engineFunction: "moveTowardsMouse", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Shoot Towards Mouse", engineFunction: "shootTowardsMouse", parameters: [
        {label: "Speed (m/s)", inputType: "number"}
    ]},
    {elementName: "Move Towards Object", engineFunction: "moveTowardsPoint", parameters: [
        {label: "Target Object", inputType: "canvasElements"}
    ]},
    {elementName: "Copy Object", engineFunction: "copyObject", parameters: [{label: "X Coordinate", inputType: "number"},
        {label: "Y Coordinate", inputType: "number"}]},
    {elementName: "Post position to server", engineFunction: "posToServer", parameters: [{label: "Server URL", inputType: "text"}]},
    {elementName: "Get position from server", engineFunction: "posFromServer", parameters: [{label: "Server URL", inputType: "text"}]},
    {elementName: "Destroy Object", engineFunction: "destroy"}
];

var spriteEvents = [
    {elementName: "On any Collision", targetFunction: "contact"},
    {elementName: "On Collision With Object", targetFunction: "collision", parameters: [
        {label: "Target Object", inputType: "canvasElements"}
    ]}
];

/** Create a new canvas element
 *
 * @param x - X coordinate of new element
 * @param y - Y coordinate of new element
 * @param width - Width of new element
 * @param height - Height of new element
 * @param targetCanvas - Canvas to draw new element to
 * @param image - Image of new element
 * @param elementName - Name of new element
 * @param draggable - Set to true if object can be dragged around screen
 * @param selectable - Set to true if object is selectable
 * @param behaviours - Behaviours of new element
 * @param events - Events of new element
 * @constructor
 */

function CanvasElement(x, y, width, height, targetCanvas, image, elementName, draggable, selectable, behaviours, events) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.targetCanvas = targetCanvas;
    this.image = image;
    this.elementName = elementName || "Element " + canvasElements.length;
    this.draggable = draggable;
    this.selectable = selectable;
    this.highlightRect = -1;
    this.behaviours = behaviours;
    this.listenerEvents = events || spriteEvents;
    this.executorEvents = spriteExecutors;
    this.addedEvents = [];
    this.type = "dynamic";
    this.shape = "block";

}

/** Create new element group
 *
 * @param groupName - Name of new group
 * @param elements - Elements contained in new group
 * @constructor
 */

function CanvasGroup(groupName, elements){

    this.elementName = groupName;
    this.elements = elements || [];
    this.listenerEvents = spriteEvents;
    this.executorEvents = spriteExecutors;
    this.addedEvents = [];

}

/**Drag an element around the Creation Canvas
 *
 */

CanvasElement.prototype.dragElement = function () {

    this.x += mouse.x - mouse.oldX;
    this.y += mouse.y - mouse.oldY;

    mouse.oldX = mouse.x;
    mouse.oldY = mouse.y;

    if (this.highlightRect >= 0) {
        this.unHighlight();
    }

    this.highlight();

};

/** Drop an element when dragging is complete
 *
 */

CanvasElement.prototype.dropElement = function () {

    if (!dragging()) {
        this.elementClicked();
    }

    //Behaviour bar not fully implemented
    /*if (canvasRects.length > 0)this.showBehaviourBar(this.behaviours);
    else hideBehaviourBar();*/

};

/** Highlight an element when clicked
 *
 */

CanvasElement.prototype.elementClicked = function () {

    if (this.selectable) {

        if (this.highlightRect >= 0) {
            this.unHighlight();
        }
        else {
            this.highlight();
        }

    }
};

/** Show the context menu when screen is right clicked
 *
 * @param e - Contains mouse data
 */

elementRightClicked = function (e) {

    rightMenu.style.top = mouse.y;
    rightMenu.style.left = mouse.x;

};

/** Draw a rectangle around an element to highlight it
 *
 */

CanvasElement.prototype.highlight = function () {

    this.targetCanvas.context.fillStyle = 'blue';
    this.targetCanvas.context.strokeRect(this.targetCanvas.width + 100, this.targetCanvas.height + 100, this.width, this.height);

    canvasRects.push(new CanvasRectangle(this.x, this.y, this.width, this.height, this.targetCanvas, 'blue', 'stroke'));
    this.highlightRect = canvasRects.length - 1;

    $("#elementSettingsButton").removeClass('ui-disabled');

};

/** Delete any rectangle around an element to unhighlight it
 *
 */

CanvasElement.prototype.unHighlight = function () {

    if (!dragging())hideBehaviourBar();

    canvasRects.splice(this.highlightRect, 1);
    this.highlightRect = -1;

    showWorldSettings();

    var elementButton = $("#elementSettingsButton");

    elementButton.removeClass('ui-btn-active');
    elementButton.addClass('ui-disabled');

};

/** Show the behaviour bar
 *
 */

CanvasElement.prototype.showBehaviourBar = function () {

    $("#behaviourDiv").show().animate({bottom: 0});
    $("#addBehaviourButton").bind('click', this.showAddBehaviour);

};

/** Show the add behaviour screen
 *
 */

CanvasElement.prototype.showAddBehaviour = function(){

    var addBehaviourDiv = $("#addBehaviourDiv");

    if($(addBehaviourDiv).is(":visible")) addBehaviourDiv.hide();
    else addBehaviourDiv.show();

};

/** Hide the behaviour bar
 *
 */

function hideBehaviourBar() {
    $("#addBehaviourDiv").hide();
    $("#behaviourDiv").animate({bottom: '-25%'});
}

/** Delete an element
 *
 */

CanvasElement.prototype.deleteElement = function () {

    this.unHighlight();
    canvasElements.splice(canvasElements.indexOf(this), 1);
    generalFunctions.createList(canvasElements, $("#elementList"));

};