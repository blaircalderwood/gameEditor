var compileText = "";

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

        for(var item = 0; item < genericsArray.length; item ++)targetList.push(genericsArray[item]);
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

function genericsArrayNames(){

    var targetList = [];
    for(var item = 0; item < genericsArray.length; item ++)targetList.push(genericsArray[item].elementName);
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

function updateEventList(newEventString) {

    eventsList.push(newEventString);

    createList(eventsList, $("#eventsList"));

}

function compileEvent() {

    var genericsNames = genericsArrayNames();

    console.log(genericsNames);
    if (!this.parametersDetails) {
        this.parametersDetails = [];
        this.parametersDetails[0] = "";
    }
    var i = eventCompiler.arrayIndex;

    eventCompiler.parameterArray = 10;

    eventCompiler.eventExecutor = this.engineFunction;

    var newEvent = "spriteArray[" + i + "].";

    console.log(eventCompiler.eventListener);

    if(eventCompiler.eventListener.targetFunction == "collision"){
        newEvent += "addCollisionEvent(spriteArray[" + i + "]." + this.engineFunction + ", " + eventCompiler.eventListener.parametersDetails[0];
        console.log(newEvent);
    }

    else if (eventCompiler.listenerElement.elementName == "Keyboard") {
        newEvent += "addKeyDownEvent('" + eventCompiler.eventListener.parametersDetails[0] + "', spriteArray[" + i + "]." + this.engineFunction;
        eventCompiler.eventListener.parametersDetails.splice(0, 1);
    }

    else if(genericsNames.indexOf(eventCompiler.listenerElement.elementName) == -1){
        newEvent += "addEvent(spriteArray[" + i + "]." + this.engineFunction + ", spriteArray[" + i + "]." + eventCompiler.eventListener.targetFunction;
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

/** Compile all features set by the user into a local storage file ready to be run by the game engine as a full game
 *
 */

function compile() {

    compileText = "$('#physicsCanvas').width(" + mainCanvas.width + ");$('#physicsCanvas').height(" + mainCanvas.height + ");";

    compileText += "var firstBody;";

    for (var i = 0; i < canvasElements.length; i++) {

        compileText += "firstBody = new Body(physics, {" +
        "type: '" + canvasElements[i].type + "'," +
        "shape: 'circle'," +
        "radius: " + (canvasElements[i].width / 2) + "/ physics.scale," +
        "x:  " + (canvasElements[i].x + (canvasElements[i].width / 2)) + "/ physics.scale," +
        "y: " + (canvasElements[i].y + (canvasElements[i].height / 2)) + "/ physics.scale," +
        "width: " + canvasElements[i].width + "/ physics.scale," +
        "height: " + canvasElements[i].height + "/ physics.scale," +
        "image: '" + canvasElements[i].image.src + "'});" +
        "spriteArray.push(firstBody);" +
        "physics.world.SetGravity(new b2Vec2(" + worldGravity.horizontal + ", " + worldGravity.vertical + "));";

    }

    for(i = 0; i < canvasElements.length; i ++){

        for (var j = 0; j < canvasElements[i].addedEvents.length; j++) {

            compileText += canvasElements[i].addedEvents[j];

        }



        //compileText += "spriteArray[0].addEvent(spriteArray[1].destroy, spriteArray[0].contact);"

    }

    if($("#bounceWalls").is(":checked") == true) compileText += "physics.addScreenBounds();";

    compileText += "startEngine();";

    console.log(compileText);

    localStorage.setItem('compiledText', compileText);

    window.open("../Engine/index.html");

}