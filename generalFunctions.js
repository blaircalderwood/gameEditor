var generalFunctions = {};

generalFunctions.createList = function(array, JQMListElement, callback, callbackParamArray){

        JQMListElement.empty();

        for (var i = 0; i < array.length; i ++){

            var listItem = document.createElement("li"),

                anchor = document.createElement("a");
            if(array[i].elementName) anchor.innerText = array[i].elementName;
            else console.log("Create List - Element Name not found for array object " + i);

            listItem.appendChild(anchor);
            JQMListElement.append(listItem);

            (function(el){
                listItem.onclick = function(){
                    console.log(el);
                    if(array[el].elementClicked)array[el].elementClicked();
                    else console.log("Create List - Element does not have clicked function");
                };
            })(i);

        }

        if ( JQMListElement.hasClass('ui-listview')) {
            JQMListElement.listview('refresh');
        }
        else {
            JQMListElement.trigger('create');
        }

    if(callback)execCallback(callback, callbackParamArray);

};

generalFunctions.loadImages = function(callback, callbackParamArray, images) {

    var finishedImages = [];

    if (!Array.isArray(callbackParamArray))callbackParamArray = [callbackParamArray];

    for (var i = 0; i < images.length; i++) {

        var image = new Image();
        image.src = images[i];

        image.onload = (function () {

            finishedImages.push(image);

            if (finishedImages.length >= images.length) {
                callbackParamArray.push(finishedImages);
            }
        })(image)

    }

};

function execCallback(callback, callbackParamArray){

    console.log(callbackParamArray);
    if(callbackParamArray)callback.apply(this, callbackParamArray);
    else callback();

}
