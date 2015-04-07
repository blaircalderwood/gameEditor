var generalFunctions = {};

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
