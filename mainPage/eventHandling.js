var compileText = "";

/** Show events that can act as listeners in order to carry out a certain task
 *
 * @param array - Array of listener events
 * @param onClickFunction - Function to execute when element is pressed
 * @param showGenerics - True if list should contain mouse, keyboard, gamepad and system objects
 * @param showGroups - True if list should contain element groups
 * @returns {Array} - List of listeners ready for on screen display
 */

function eventElementsList(array, onClickFunction, showGenerics, showGroups) {

    var targetList = [];

    var j = 0, item = 0;

    if (showGenerics && showGenerics == true) {

        for (item = 0; item < genericsArray.length; item++)targetList.push(genericsArray[item]);
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

    if (showGroups && showGroups == true) {

        for (item = 0; item < canvasGroups.length; item++)targetList.push(canvasGroups[item]);
        for (var l = k; l < targetList.length; l++) targetList[l].elementClicked = onClickFunction;

    }

    return targetList;

}

/** Returns a list of mouse, keyboard, gamepad and system objects
 *
 * @returns {Array} - Array list
 */

function genericsArrayNames() {

    var targetList = [];
    for (var item = 0; item < genericsArray.length; item++)targetList.push(genericsArray[item].elementName);
    return targetList;

}

/** Shows the Event Creation System window with a list of elements
 *
 */

function showListenerElements() {

    showWidget($("#eventCreatorDiv"));
    $("#addEventTask").empty();
    generalFunctions.createList(eventElementsList(canvasElements, showListenerTasks, true, true), $("#addEventListener"));

}

/** Shows the list of tasks assigned to elements
 *
 */

function showListenerTasks() {

    eventCompiler.listenerElement = this;
    generalFunctions.createList(eventElementsList(this.listenerEvents, showExecutorElements, false, false), $("#addEventTask"));

}

/** Shows the list of elements that have executors assigned to them
 *
 */

function showExecutorElements() {

    eventCompiler.eventListener = this;

    $("#addEventTask").empty();
    generalFunctions.createList(eventElementsList(canvasElements, showExecutorTasks, false, true), $("#addEventListener"));

}

/** Shows the list of tasks assigned to executor elements
 *
 */

function showExecutorTasks() {

    eventCompiler.targetElement = this;
    eventCompiler.arrayIndex = this.arrayIndex;
    generalFunctions.createList(eventElementsList(this.executorEvents, compileGroupEvent, false, false), $("#addEventTask"));

}

/** Show the newly create event in the Main Screen's event list
 *
 * @param newEventString - Description of new event
 */

function updateEventList(newEventString) {

    eventsList.push(newEventString);

    generalFunctions.createList(eventsList, $("#eventsList"));

}

/** Loop through groups to create collision events for all elements
 *
 * @param thisObject - Grouped object
 * @param collidingObject - Object that has collided with group object
 */

function canvasGroupLoop(thisObject, collidingObject){

  for(var i = 0; i < canvasGroups[collidingObject].elements.length; i ++){
      eventCompiler.eventListener.parametersDetails[0] = canvasGroups[collidingObject].elements[i];
      console.log(thisObject);
      compileEvent.apply(thisObject);
  }
}

/** Create events for all elements in a group
 *
 */

function compileGroupEvent() {

    var listenerIndex = canvasGroups.indexOf(eventCompiler.listenerElement);
    var executorIndex = canvasGroups.indexOf(eventCompiler.targetElement);
    var i, k;
    var collidingObject = -1;

    for(var l = 0; l < canvasGroups.length; l ++){
        if(eventCompiler.eventListener.parametersDetails && canvasGroups[l].elementName == eventCompiler.eventListener.parametersDetails[0]){
            collidingObject = l;
        }
    }

    if (listenerIndex == -1 && executorIndex !== -1) {

        for (k = 0; k < canvasGroups[executorIndex].elements.length; k++) {

            eventCompiler.targetElement = canvasGroups[executorIndex].elements[k];
            eventCompiler.arrayIndex = k;
            console.log(eventCompiler.arrayIndex);
            if(collidingObject !== -1) canvasGroupLoop(this, collidingObject);
            else compileEvent.apply(this);

        }
    }

    else if (listenerIndex !== -1 && executorIndex == -1) {

        for (i = 0; i < canvasGroups[listenerIndex].elements.length; i++) {

            eventCompiler.listenerElement = canvasGroups[listenerIndex].elements[i];
            console.log(eventCompiler.arrayIndex);
            if(collidingObject !== -1) canvasGroupLoop(this, collidingObject);
            else compileEvent.apply(this);

        }
    }

    else if (listenerIndex !== -1 && executorIndex !== -1) {

        for (i = 0; i < canvasGroups[listenerIndex].elements.length; i++) {
            for (k = 0; k < canvasGroups[executorIndex].elements.length; k++) {

                eventCompiler.listenerElement = canvasGroups[listenerIndex].elements[i];
                eventCompiler.targetElement = canvasGroups[executorIndex].elements[k];
                eventCompiler.arrayIndex = k;
                console.log(eventCompiler.arrayIndex);
                if(collidingObject !== -1) canvasGroupLoop(this, collidingObject);
                else compileEvent.apply(this);

            }
        }
    }

    else compileEvent.apply(this);

}

/** Create the Add Event code that will be read and executed by the game engine
 *
 */

function compileEvent() {

    var genericsNames = genericsArrayNames();

    console.log(this.parametersDetails);
    if (!this.parametersDetails) {
        this.parametersDetails = [];
        this.parametersDetails[0] = "";
    }
    var executorIndex = eventCompiler.arrayIndex;

    var listenerIndex = canvasElements.indexOf(eventCompiler.listenerElement);
    if (listenerIndex == -1) listenerIndex = executorIndex;
    console.log(listenerIndex);

    eventCompiler.parameterArray = 10;

    eventCompiler.eventExecutor = this.engineFunction;

    var newEvent = "spriteArray[" + executorIndex + "].";

    function checkObject(f, j) {

        if (canvasElements[f].elementName == eventCompiler.eventListener.parametersDetails[0][j]) {
            collidingObject = f;
            newEvent += "addCollisionEvent('" + this.engineFunction + "', spriteArray[" + collidingObject + "]";
        }

    }

    if (eventCompiler.eventListener.targetFunction == "collision") {
        console.log(eventCompiler.eventListener.parametersDetails[0]);
        var collidingObject = -1;
        for (var f = 0; f < canvasElements.length; f++) {
            console.log(eventCompiler.eventListener.parametersDetails[0].elementName);
            if(Array.isArray(eventCompiler.eventListener.parametersDetails[0])){
                for(var j = 0; j < eventCompiler.eventListener.parametersDetails[0].length; j ++){

                    checkObject.call(this, f, j);
                }

            }
            else checkObject.call(this, f);
        }

        console.log(newEvent);
    }

    else if (eventCompiler.listenerElement.engineFunction == "keyDown" || eventCompiler.listenerElement.engineFunction == "keyUp") {
        newEvent += "addKeyDownEvent('" + eventCompiler.eventListener.parametersDetails[0] + "','" + this.engineFunction + "'";
    }

    else if (eventCompiler.listenerElement.elementName == "Gamepad"){
        newEvent += "addGamepadEvent('" + eventCompiler.eventListener.parametersDetails[0] + "','" + this.engineFunction + "'";
    }

    else if (genericsNames.indexOf(eventCompiler.listenerElement.elementName) == -1) {
        newEvent += "addEvent('" + this.engineFunction + "', spriteArray[" + listenerIndex + "]." + eventCompiler.eventListener.targetFunction;
    }

    else newEvent += "addEvent('" + this.engineFunction + "', " + eventCompiler.eventListener.targetFunction;

    if (this.parametersDetails[0])newEvent += ", " + this.parametersDetails[0];

    newEvent += ");";
    canvasElements[executorIndex].addedEvents.push(newEvent);

    var eventString = {};

    eventString.elementName = eventCompiler.listenerElement.elementName + " " + eventCompiler.eventListener.elementName + " - " + eventCompiler.eventExecutor + " on " + canvasElements[eventCompiler.arrayIndex].elementName;

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

    //compileText = "physicsCanvas = new CanvasElement('physicsCanvas', 0, 0, " + mainCanvas.width + ", " + mainCanvas.height + ")";
    compileText = "physicsCanvas.canvas.width = " + mainCanvas.width + ";physicsCanvas.canvas.height = " + mainCanvas.height + ";";

    compileText += "var firstBody;";

    for (var i = 0; i < canvasElements.length; i++) {

        compileText += "firstBody = new Body(physics, {" +
        "type: '" + canvasElements[i].type + "'," +
        "shape: '" + canvasElements[i].shape + "'," +
        "radius: " + (canvasElements[i].width / 2) + "/ physics.scale," +
        "x:  " + (canvasElements[i].x + (canvasElements[i].width / 2)) + "/ physics.scale," +
        "y: " + (canvasElements[i].y + (canvasElements[i].height / 2)) + "/ physics.scale," +
        "width: " + canvasElements[i].width + "/ physics.scale," +
        "height: " + canvasElements[i].height + "/ physics.scale," +
        "image: '" + canvasElements[i].image.src + "'});" +
        "spriteArray.push(firstBody);" +
        "physics.world.SetGravity(new b2Vec2(" + worldGravity.horizontal + ", " + worldGravity.vertical + "));";

    }

    for (i = 0; i < canvasElements.length; i++) {

        for (var j = 0; j < canvasElements[i].addedEvents.length; j++) {

            compileText += canvasElements[i].addedEvents[j];

        }


        //compileText += "spriteArray[0].addEvent(spriteArray[1].destroy, spriteArray[0].contact);"

    }

    if ($("#bounceWalls").is(":checked") == true) compileText += "physics.addScreenBounds();";

    compileText += "startEngine();";

    console.log(compileText);

    localStorage.setItem('compiledText', compileText);

    window.open("../Engine/index.html");

}