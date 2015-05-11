var generalFunctions = {};

generalFunctions.createList = function (array, JQMListElement, callback, callbackParamArray) {

    JQMListElement.empty();

    for (var i = 0; i < array.length; i++) {

        var listItem = document.createElement("li");

        if (!array[i].parameters) {

            var anchor = document.createElement("a");
            if (array[i].elementName) anchor.innerText = anchor.title = anchor.textContent = array[i].elementName;
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

            var newHTML = "<div data-role = 'collapsible' data-inset='false' data-iconpos='right' style='width: 100%; padding-left: 3.3%'><h4>" + array[i].elementName + "</h4><ul data-role = 'listview'>";
            var collapsibles = 0;

            for (var z = 0; z < array[i].parameters.length; z++) {

                var parameterItem = array[i].parameters[z];

                newHTML += "<li><label>" + parameterItem.label + "</label>";

                if (parameterItem.inputType == "list")newHTML = createSelectList(newHTML, parameterItem);

                else if (parameterItem.inputType == "canvasElements") {
                    parameterItem.inputList = fillCanvasElements(true);
                    newHTML = createSelectList(newHTML, parameterItem, i, z);
                }

                else if (parameterItem.inputType == "keyList") {
                    parameterItem.inputList = fillKeys();
                    newHTML = createSelectList(newHTML, parameterItem, i, z);
                }

                else if (parameterItem.inputType == "buttonList"){
                    parameterItem.inputList = fillButtons();
                    newHTML = createSelectList(newHTML, parameterItem, i, z);
                }

                else if (parameterItem.inputType) newHTML += "<input id='" + i + "collapsibles" + z + "' type='" + parameterItem.inputType + "'></input>";

                newHTML += "</input></li>";

            }

            collapsibles = array[i].parameters.length;
            console.log(collapsibles);
            $(listItem).append(newHTML);
            newHTML += "<a data-role='button' id = '" + i + "Submit'>Submit</a>";

            newHTML += "</ul></div>";
            JQMListElement.append(newHTML);

            (function (i, collapsibles) {
                $("#" + i + "Submit").button().bind('click', function () {

                    var parametersDetails = [];

                    for (var y = 0; y < collapsibles; y++) {

                        var newParam = $("#" + i + "collapsibles" + y);

                        parametersDetails[y] = newParam.val();
                    }
                    array[i].parametersDetails = parametersDetails;
                    console.log(array[i]);
                    if (array[i].elementClicked)array[i].elementClicked();
                    else console.log("Create List - Element does not have clicked function");

                });

            }(i, collapsibles));

            $('div[data-role=collapsible]').collapsible();

        }

    }

    refreshList(JQMListElement);

    if (callback)execCallback(callback, callbackParamArray);
    else return callbackParamArray;

};

function refreshList(list) {

    if (list.hasClass('ui-listview')) {
        list.listview('refresh');
    }
    else {
        list.trigger('create');
    }

}

generalFunctions.loadImages = function (callback, callbackParamArray, images) {

    var finishedImages = [];

    if (!Array.isArray(callbackParamArray))callbackParamArray = [callbackParamArray];

    for (var i = 0; i < images.length; i++) {

        var image = new Image();
        image.src = images[i];

        image.onload = function () {

            finishedImages.push(image);

            if (finishedImages.length >= images.length) {
                callbackParamArray.push(finishedImages);
                if (callback)execCallback(callback, callbackParamArray);
            }
        }(image);

    }

};

/** Get data from the server and execute a callback upon receiving.
 *
 * @param url - Server URL
 * @param callback - Function to execute when data is recieved from the server.
 */

generalFunctions.getAjax = function(url, callback){

        $.ajax({
            type: "GET",
            url: url,
            async: "true",
            contentType: "application/json",
            dataType: 'jsonp',
            success: callback || function () {
                console.log("Recieved data");
            }
        });

};

function execCallback(callback, callbackParamArray) {

    console.log(callbackParamArray);
    if (callbackParamArray)callback.apply(this, callbackParamArray);
    else callback();

}

//String functions

/** Returns an ASCII value when given a keyboard key
 *
 * @returns {number}
 */

String.prototype.toASCII = function () {
    return this.toUpperCase().charCodeAt(0);
};

//Number Functions

/** Returns the tangent between two objects
 *
 * @param object1
 * @param object2
 * @returns {number}
 */

function tanAngle(object1, object2) {

    return Math.atan2(object1.x - object2.x, object2.y - object1.y);

}
