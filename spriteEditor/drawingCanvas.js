var context, drawingCanvas, clickedElement, fileRead;
var mouseDown = false, prevTouched = false, isDragEnabled = false;
var mouse = {};
var selected = {down: "", move: "", up: ""};
var savedX, savedY = 0;
var undoQueue = [], redoQueue = [], canvasElements = [];

/** Prepare the canvas for a new drawing
 *
 */

function canvasLoad() {

    drawingCanvas = document.getElementById("drawingCanvas");
    context = drawingCanvas.getContext("2d");

    context.fillStyle = 'blue';

    setEraseTimer();

    setCanvasPos();

    $(window).on('resize', setCanvasPos);

    changeDimensionsValues();

    $("#lineWidthPicker").bind('change', lineChange);
    changeColour();

    saveContext();

    selected = new Selected(paint, paint);

    drawingCanvas.addEventListener('touchstart', putMouseDown);
    drawingCanvas.addEventListener('touchmove', function () {
        mouseMove(event)
    });
    drawingCanvas.addEventListener('touchend', mouseUp);

}

/** Erase the drawing when Sprite Editor window is closed
 *
 */

function setEraseTimer(){

    var eraseTimer = setInterval(function () {

        if (sessionStorage.image == undefined) {
            eraseDrawing();
            canvasLoad();
        }

    }, 2000);

}

/** Clear the canvas area
 *
 */

function eraseDrawing() {

    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

}

/** Change the canvas size
 *
 */

function setCanvasSize() {

    var contentDiv = $("#contentDiv");
    contentDiv.width = $(window).outerWidth();
    contentDiv.height = $(window).outerHeight();

}

/** Change the canvas position
 *
 */

function setCanvasPos() {

    var contentDiv = $("#contentDiv");
    var headerHeight = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight() - 1 : $(".ui-header").outerHeight();
    var drawSize = (($("#drawingPage").outerHeight() + headerHeight) / 2) - (drawingCanvas.height / 2);

    contentDiv.css('left', 50 + '%');
    contentDiv.css('top', drawSize + 'px');

}

/** Set the values of the dimension input boxes on page load
 *
 */

function changeDimensionsValues() {

    $("#dimensionsPickerWidth").val(drawingCanvas.width);
    $("#dimensionsPickerHeight").val(drawingCanvas.height);


}

/** Change the dimensions of any loaded image to fit the canvas
 *
 */

function changeDimensions() {

    var currentImg = context.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);

    drawingCanvas.width = $("#dimensionsPickerWidth").val();
    drawingCanvas.height = $("#dimensionsPickerHeight").val();

    setCanvasPos();
    context.putImageData(currentImg, (drawingCanvas.width / 2) - (currentImg.width / 2), (drawingCanvas.height / 2) - (currentImg.height / 2));

}

/** Execute a set of functions related to a tool e.g. Create Rectangle
 *
 * @param down - Function to execute when mouse is down
 * @param move - Function to execute when mouse is moving
 * @param up - Function to execute when mouse is released
 * @constructor
 */

function Selected(down, move, up) {

    var contentDiv = $('#contentDiv');

    if (isDragEnabled) {
        contentDiv.draggable("disable");
    }

    if (down)this.down = down;
    else this.down = "";

    if (move)this.move = move;
    else this.move = "";

    if (up)this.up = up;
    else this.up = "";

}

/** Enable mouse dragging
 *
 */

function dragEnabled() {

    selected = new Selected();
    $("#contentDiv").draggable();
    isDragEnabled = true;

}

/** Paint directly onto the canvas
 *
 */

function paint() {

    context.beginPath();
    context.moveTo(mouse.oldX, mouse.oldY);
    context.lineTo(mouse.x, mouse.y);
    context.stroke();

}

/** Set mouse values to show that mouse button is down
 *
 */

function putMouseDown() {

    prevTouched = false;
    mouseDown = true;
    if (selected.down)selected.down();

}

/** Execute appropriate functions when mouse is moved
 *
 * @param e - Contains mouse data
 */

function mouseMove(e) {

    if (e.touches) {

        if (prevTouched) {

            mouse.oldX = mouse.x;
            mouse.oldY = mouse.y;

            mouse.x = e.touches[0].clientX - drawingCanvas.getBoundingClientRect().left;
            mouse.y = e.touches[0].clientY - drawingCanvas.getBoundingClientRect().top;

        }

        else {

            mouse.oldX = mouse.x = e.touches[0].clientX - drawingCanvas.getBoundingClientRect().left;
            mouse.oldY = mouse.y = e.touches[0].clientY - drawingCanvas.getBoundingClientRect().top;
            saveCoords();
            prevTouched = true;

        }

        checkAndMove();
    }

    else if (e.pageX) {

        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;

        mouse.x = e.pageX - drawingCanvas.getBoundingClientRect().left;
        mouse.y = e.pageY - drawingCanvas.getBoundingClientRect().top;

        checkAndMove();
    }
    else if (e.touches.length < 0) {
        mouseUp();
    }

}

/** Execute all tool functions related to mouse movement
 *
 */

function checkAndMove() {

    if (mouseDown && selected.move) {
        selected.move();
    }

}

/** Execute all tool functions related to mouse release
 *
 */

function mouseUp() {

    mouseDown = false;

    if (selected.up)selected.up();

    saveContext();

}

/** Change the colour currently being drawn onto the canvas
 *
 */

function changeColour() {

    var colourPicker = document.getElementById("colourPicker");
    context.strokeStyle = context.fillStyle = "#" + colourPicker.color;

}

/** Change the width of the line being drawn onto the canvas
 *
 */

function lineChange() {
    context.lineWidth = document.getElementById("lineWidthPicker").value;
    console.log(context.lineWidth);
}

/** Save the mouse coordinates for later use
 *
 */

function saveCoords() {

    savedX = mouse.x;
    savedY = mouse.y;

}

/** Show a shape preview before mouse is release to show user where newly drawn shape will be positioned
 *
 */

function previewShape() {

    if (undoQueue.length > 0) {
        context.putImageData(undoQueue[undoQueue.length - 1], 0, 0);
        this.up()
    }
    else {

        var oldFill = context.fillStyle;
        context.fillStyle = 'white';
        context.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        context.fillStyle = oldFill;
        this.up();
    }

}

/** Draw rectangle
 *
 */

function rectUp() {

    context.beginPath();
    context.fillRect(savedX, savedY, (mouse.x - savedX), (mouse.y - savedY));
    context.stroke();

}

/** Draw circle
 *
 */

function circUp() {

    var x = (mouse.x - savedX);
    var y = mouse.y - savedY;
    var distance = Math.sqrt((x * x) + (y * y)) / 2;
    context.beginPath();

    context.arc(savedX + distance, savedY + distance, distance, 0, 360);

    context.fill();

}

/** Highlight any drawn elements
 *
 */

function highlight() {

    if (clickedElement) {
        context.fillStyle = 'blue';
        context.strokeRect(drawingCanvas.width + 100, drawingCanvas.height + 100, clickedElement.width, clickedElement.height);

        canvasRects.push(new CanvasRectangle(this.x, this.y, this.width, this.height, this.targetCanvas, 'blue', 'stroke'));
        this.highlightRect = canvasRects.length - 1;

    }

}

/** Create a new undo point for easy mistake rectification
 *
 */

function saveContext() {

    undoQueue.push(context.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height));

    if (redoQueue.length > 0) {
        redoQueue = [];
    }

    saveDrawing();

}

/** Undo previous action
 *
 * @param popQueue - Array containing previously carried out actions
 * @param pushQueue - Array containing previously undid actions
 */

function undo(popQueue, pushQueue) {

    if (popQueue.length > 0) {

        var doStuff = popQueue.pop();
        pushQueue.push(doStuff);
        context.putImageData(doStuff, 0, 0);

    }

}

/** Save the new drawing to local storage
 *
 */

function saveDrawing() {
    sessionStorage.setItem('image', drawingCanvas.toDataURL("image/png"));
}

/** Upload any images the user selects to the web page
 *
 * @param target - Uploaded file
 */

function fileUpload(target) {

    var files = target.files[0];

    fileRead = new FileReader();
    fileRead.readAsDataURL(files);
    fileRead.onload = showImage;

}

/** Show any newly uploaded images on the drawing canvas
 *
 */

function showImage() {

    var tempImage = new Image();
    tempImage.src = fileRead.result;

    context.drawImage(tempImage, 0, 0, drawingCanvas.width, drawingCanvas.height);

    saveContext();

}