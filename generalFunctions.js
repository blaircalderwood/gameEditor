var generalFunctions = {};

generalFunctions.createList = function (array, JQMListElement, callback, callbackParamArray) {

    JQMListElement.empty();

    for (var i = 0; i < array.length; i++) {

        var listItem = document.createElement("li");

        if (!array[i].parameters) {

            var anchor = document.createElement("a");
            if (array[i].elementName) anchor.innerText = array[i].elementName;
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

            var collapsibles = [];

            var divItem = document.createElement("div");

            var ul = document.createElement("ul");

            var anchor1 = document.createElement("h4");

            var submitLi = document.createElement("li");
            var submitButton = document.createElement("a");
            $(submitButton).attr("data-type", "button");
            submitButton.innerText = "Submit";
            $(submitButton).button();

            if (array[i].elementName) anchor1.innerText = array[i].elementName;
            else console.log("Create List - Element Name not found for array object " + i);

            divItem.appendChild(anchor1);

            for (var z = 0; z < array[i].parameters.length; z++) {

                var collapsibleItem = document.createElement("li");
                var collapsibleInput = document.createElement("input");
                collapsibleItem.appendChild(collapsibleInput);

                ul.appendChild(collapsibleItem);

                collapsibles.push(collapsibleInput);

            }

            (function (el, collapsibles) {

                submitButton.onclick = function () {

                    var parametersDetails = [];

                    for (var y = 0; y < collapsibles.length; y++) {
                        console.log(collapsibles[y].value);
                        parametersDetails[y] = collapsibles[y].value;
                    }
                    array[el].parametersDetails = parametersDetails;
                    console.log(array[el]);
                    if (array[el].elementClicked)array[el].elementClicked();
                    else console.log("Create List - Element does not have clicked function");

                };
            })(i, collapsibles);


            submitLi.appendChild(submitButton);

            ul.appendChild(submitLi);

            divItem.appendChild(ul);
            refreshList($(ul));
            listItem.appendChild(divItem);

            $(divItem).attr("data-role", "collapsible");
            $(divItem).attr("data-inset", false);
            $(divItem).collapsible();

            JQMListElement.append(listItem);

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

function execCallback(callback, callbackParamArray) {

    console.log(callbackParamArray);
    if (callbackParamArray)callback.apply(this, callbackParamArray);
    else callback();

}
