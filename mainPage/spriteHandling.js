/** Load a drawing made in sprite editor via local storage
 *
 */

function loadCanvasDrawing() {

    if (sessionStorage.image) {
        var data = sessionStorage.getItem('image');

        var tempImage = new Image();
        tempImage.src = data;

        tempImage.onload = function () {

            var renameText = $("#renameText");
            canvasElements.push(new CanvasElement(mainCanvas.width / 2, mainCanvas.height / 2,
                tempImage.width, tempImage.height, mainCanvas, tempImage, renameText.val(), true, true));
            showElementsList();
            renameText.val("");
        };

        sessionStorage.removeItem('image');

    }

}

function renameSprite(){

    var renameDialog = $("#renameDialog");
    renameDialog.dialog({
        buttons: {
            "Save": function () {
                if($("#renameText").val() !== "") {
                    loadCanvasDrawing();
                    $(this).dialog("close");
                }
                else{
                    renameDialog.innerHTML = "Please enter a valid element name";
                }
            }

        }

    })

}

function addNewGroup(){

    var groupDialog = $("#newGroupDialog");

    groupDialog.dialog({
        buttons: {
            "Save": function () {

                var groupText = $("#renameGroupText").val();

                if(groupText !== "") {

                    setGroupName(groupText);
                    $(this).dialog("close");
                }
                else{
                    groupDialog.innerHTML = "Please enter a valid element name";
                }
            }

        }

    })

}

function setGroupName(groupName){

    canvasGroups.push(new CanvasGroup(groupName));
    showGroupsList();

}