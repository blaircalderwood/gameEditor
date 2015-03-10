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
    this.events = events;
    this.executorEvents = [{elementName: "Rotate", engineFunction: "rotate"}, {elementName: "Move Left", engineFunction: "moveLeft"}];
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

    if(canvasRects.length > 0)this.showBehaviourBar(this.behaviours);
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

};

function unHighlightElements() {

    hideBehaviourBar();

    for (var i = 0; i < canvasElements.length; i++) {
        canvasElements[i].unHighlight();
    }

}

CanvasElement.prototype.unHighlight = function () {

    if(!dragging())hideBehaviourBar();

    canvasRects.splice(this.highlightRect, 1);
    this.highlightRect = -1;

};

CanvasElement.prototype.showBehaviourBar = function (targetBehaviours) {

    $("#behaviourDiv").show().animate({bottom: 0});
    //behavioursShown = this.id;

};

function hideBehaviourBar() {
    $("#behaviourDiv").animate({bottom: '-25%'});
}