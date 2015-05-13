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

//Canvas Element Prototypes
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

function CanvasGroup(groupName, elements){

    this.elementName = groupName;
    this.elements = elements || [];
    this.listenerEvents = spriteEvents;
    this.executorEvents = spriteExecutors;
    this.addedEvents = [];

}

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

CanvasElement.prototype.dropElement = function () {

    if (!dragging()) {
        this.elementClicked();
    }

    if (canvasRects.length > 0)this.showBehaviourBar(this.behaviours);
    else hideBehaviourBar();

};

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

elementRightClicked = function (e) {

    rightMenu.style.top = mouse.y;
    rightMenu.style.left = mouse.x;

};

CanvasElement.prototype.highlight = function () {

    this.targetCanvas.context.fillStyle = 'blue';
    this.targetCanvas.context.strokeRect(this.targetCanvas.width + 100, this.targetCanvas.height + 100, this.width, this.height);

    canvasRects.push(new CanvasRectangle(this.x, this.y, this.width, this.height, this.targetCanvas, 'blue', 'stroke'));
    this.highlightRect = canvasRects.length - 1;

    $("#elementSettingsButton").removeClass('ui-disabled');

};

function unHighlightElements() {

    hideBehaviourBar();

    for (var i = 0; i < canvasElements.length; i++) {
        canvasElements[i].unHighlight();
    }

    showWorldSettings();

}

CanvasElement.prototype.unHighlight = function () {

    if (!dragging())hideBehaviourBar();

    canvasRects.splice(this.highlightRect, 1);
    this.highlightRect = -1;

    showWorldSettings();

    var elementButton = $("#elementSettingsButton");

    elementButton.removeClass('ui-btn-active');
    elementButton.addClass('ui-disabled');

};

CanvasElement.prototype.showBehaviourBar = function () {

    $("#behaviourDiv").show().animate({bottom: 0});
    $("#addBehaviourButton").bind('click', this.showAddBehaviour);

};

CanvasElement.prototype.showAddBehaviour = function(){

    var addBehaviourDiv = $("#addBehaviourDiv");

    if($(addBehaviourDiv).is(":visible")) addBehaviourDiv.hide();
    else addBehaviourDiv.show();

};

function hideBehaviourBar() {
    $("#addBehaviourDiv").hide();
    $("#behaviourDiv").animate({bottom: '-25%'});
}

CanvasElement.prototype.deleteElement = function () {

    this.unHighlight();
    canvasElements.splice(canvasElements.indexOf(this), 1);
    generalFunctions.createList(canvasElements, $("#elementList"));

};