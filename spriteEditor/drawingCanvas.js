var context, drawingCanvas, clickedElement, fileRead;
var mouseDown = false, prevTouched = false, isDragEnabled = false;
var mouse = {};
var selected = {down: "", move: "", up: ""};
var savedX, savedY = 0;
var undoQueue = [], redoQueue = [], canvasElements = [];

function canvasLoad () {

    drawingCanvas = document.getElementById("drawingCanvas");
    context = drawingCanvas.getContext("2d");

    context.fillStyle = 'blue';

    setCanvasPos();

    $(window).on('resize', setCanvasPos);

    changeDimensionsValues();

    $("#lineWidthPicker").bind('change', lineChange);
    changeColour();

    saveContext();

    selected = new Selected(paint, paint);

        drawingCanvas.addEventListener('touchstart', putMouseDown);
        drawingCanvas.addEventListener('touchmove', function(){
            mouseMove(event)
        });
        drawingCanvas.addEventListener('touchend', mouseUp);

}

function setCanvasSize(){

    var contentDiv = $("#contentDiv");
    contentDiv.width = $(window).outerWidth();
    contentDiv.height = $(window).outerHeight();

}

function setCanvasPos(){

    var contentDiv = $("#contentDiv");
    var headerHeight = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight()  - 1 : $(".ui-header").outerHeight();
    var drawSize = (($("#drawingPage").outerHeight() + headerHeight) / 2) - (drawingCanvas.height / 2);

    contentDiv.css('left', 50 + '%');
    contentDiv.css('top', drawSize + 'px');

}

function changeDimensionsValues(){

    $("#dimensionsPickerWidth").val(drawingCanvas.width);
    $("#dimensionsPickerHeight").val(drawingCanvas.height);

}

function changeDimensions(){

    drawingCanvas.width = $("#dimensionsPickerWidth").val();
    drawingCanvas.height = $("#dimensionsPickerHeight").val();

    setCanvasPos();

}

function Selected(down, move, up) {

    var contentDiv = $('#contentDiv');

    if(isDragEnabled){
        contentDiv.draggable("disable");
    }

    if (down)this.down = down;
    else this.down = "";

    if (move)this.move = move;
    else this.move = "";

    if (up)this.up = up;
    else this.up = "";

}

function dragEnabled(){

    selected = new Selected();
    $("#contentDiv").draggable();
    isDragEnabled = true;

}

function paint() {

    context.beginPath();
    context.moveTo(mouse.oldX, mouse.oldY);
    context.lineTo(mouse.x, mouse.y);
    context.stroke();

}

function putMouseDown() {

    prevTouched = false;
    mouseDown = true;
    if (selected.down)selected.down();

}

function mouseMove(e) {

    if(e.touches){

        if(prevTouched) {

            mouse.oldX = mouse.x;
            mouse.oldY = mouse.y;

            mouse.x = e.touches[0].clientX - drawingCanvas.getBoundingClientRect().left;
            mouse.y = e.touches[0].clientY - drawingCanvas.getBoundingClientRect().top;

        }

        else{

            mouse.oldX = mouse.x = e.touches[0].clientX - drawingCanvas.getBoundingClientRect().left;
            mouse.oldY =  mouse.y = e.touches[0].clientY - drawingCanvas.getBoundingClientRect().top;
            saveCoords();
            prevTouched = true;

        }

        checkAndMove();
    }

    else if(e.pageX){

        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;

        mouse.x = e.pageX - drawingCanvas.getBoundingClientRect().left;
        mouse.y = e.pageY - drawingCanvas.getBoundingClientRect().top;

        checkAndMove();
    }
    else if(e.touches.length < 0){
        mouseUp();
    }

}

function checkAndMove(){

    if (mouseDown && selected.move) {
        selected.move();
    }

}

function mouseUp() {

    mouseDown = false;

    if (selected.up)selected.up();

    saveContext();

}

function changeColour() {

    var colourPicker = document.getElementById("colourPicker");
    context.strokeStyle = context.fillStyle = "#" + colourPicker.color;

}

function lineChange() {
    context.lineWidth = document.getElementById("lineWidthPicker").value;
    console.log(context.lineWidth);
}

function saveCoords() {

    savedX = mouse.x;
    savedY = mouse.y;

}

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

function rectUp() {

    context.beginPath();
    context.fillRect(savedX, savedY, (mouse.x - savedX), (mouse.y - savedY));
    context.stroke();

}

function circUp() {

    var x = (mouse.x - savedX);
    var y = mouse.y - savedY;
    var distance = Math.sqrt((x * x) + (y * y)) / 2;
    context.beginPath();

    context.arc(savedX + distance, savedY + distance, distance, 0, 360);

    context.stroke();

}

function selectItem() {

    var tempRect, tempX, tempY, targetElement;

    mouseDown = true;

    for (var i = 0; i < canvasElements.length; i++) {

        targetElement = canvasElements[i];

        tempRect = drawingCanvas.getBoundingClientRect();
        tempX = e.pageX - tempRect.left;
        tempY = e.pageY - tempRect.top;

        if (tempX >= targetElement.x && tempX <= (targetElement.x + targetElement.width) &&
            tempY >= targetElement.y && tempY <= (targetElement.x + targetElement.height)) {

            clickedElement = targetElement;

        }
        else {
            targetElement.unHighlight();
        }

    }

}

function dragElement() {

    if(clickedElement) {
        clickedElement.x += mouse.x - mouse.oldX;
        clickedElement.y += mouse.y - mouse.oldY;

        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;

        if (clickedElement.highlightRect >= 0) {
            clickedElement.unHighlight();
        }

        clickedElement.highlight();

    }

}

function dropElement() {

    clickedElement = "";

}

function highlight() {

    if(clickedElement) {
        context.fillStyle = 'blue';
        context.strokeRect(drawingCanvas.width + 100, drawingCanvas.height + 100, clickedElement.width, clickedElement.height);

        canvasRects.push(new CanvasRectangle(this.x, this.y, this.width, this.height, this.targetCanvas, 'blue', 'stroke'));
        this.highlightRect = canvasRects.length - 1;

    }

}

function saveContext() {

    undoQueue.push(context.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height));

    if (redoQueue.length > 0) {
        redoQueue = [];
    }

    saveDrawing();

}

function undo(popQueue, pushQueue) {

    if (popQueue.length > 0) {

        var doStuff = popQueue.pop();
        pushQueue.push(doStuff);
        context.putImageData(doStuff, 0, 0);
        console.log(popQueue);

    }

}

function saveDrawing(){
    sessionStorage.setItem('image', drawingCanvas.toDataURL("image/png"));
}

function removeActiveClass(button, e){

    $("#navbarStuff").removeClass("ui-btn-active");
    e.preventDefault();
    console.log(button);

}

function fileUpload(target){

    var files = target.files[0];

    console.log(files);
    fileRead = new FileReader();
        fileRead.readAsDataURL(files);
    fileRead.onload = showImage;

}

function showImage(){

    console.log(fileRead.result);

    var tempImage = new Image();
    tempImage.src = fileRead.result;

    context.drawImage(tempImage, 0, 0);

}