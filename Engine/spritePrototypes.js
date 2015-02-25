function Sprite(img, x, y, width, height, zIndex, targetCanvas, behaviours, events) {

    this.img = new Image();
    this.img.src = img;

    this.x = x;
    this.y = y;

    this.savedX = -1;
    this.savedY = -1;

    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.targetCanvas = targetCanvas;

    this.behaviours = behaviours || [];

    this.events = events || [];

    gameElementsArray.push(this);

}

//Behaviours

Sprite.prototype.moveUp = function () {
    this.y -= this.speed;
};

Sprite.prototype.moveDown = function () {
    this.y += this.speed;
};

Sprite.prototype.moveLeft = function () {
    this.x -= this.speed;
};

Sprite.prototype.moveRight = function () {
    this.x += this.speed;
};

Sprite.prototype.rotateTowards = function (target) {
    this.rotation = tanAngle(target, this);
};

Sprite.prototype.moveTowards = function (target, addedRadians) {

    if (!this.boxCollision(target)) {
        this.x += Math.cos(tanAngle(this, target) + addedRadians) * this.speed;
        this.y += Math.sin(tanAngle(this, target) + addedRadians) * this.speed;
    }

};

Sprite.prototype.movePast = function (target) {

    if(target.savedX == -1 && target.savedY == -1){
        console.log(target.x, target.savedX);
        target.savedX = target.x;
        target.savedY = target.y;
        this.trajectory = tanAngle(this, {x: target.savedX, y: target.savedY}) + (Math.PI / 2);
    }

    this.x += Math.cos(this.trajectory) * this.speed;
    this.y += Math.sin(this.trajectory) * this.speed;

};

Sprite.prototype.boxCollision = function (target) {

    var collision = false;

    //Find each object corner's coordinates
    if (this && target) {
        defineCorners(this);
        defineCorners(target);

        //Loop for four corners of shape
        for (var i = 0; i <= 3; i++) {
            //If one of the corners if situated in the other object then a collision is detected
            if (target.corners[i].x >= this.corners[0].x &&
                target.corners[i].y >= this.corners[0].y &&
                target.corners[i].x <= this.corners[3].x &&
                target.corners[i].y <= this.corners[3].y) {

                collision = true;
                break;
            }
        }
    }
    return collision;

};

function defineCorners(sprite) {

    sprite.corners = [];

    //Top left
    var corner = {x: sprite.x, y: sprite.y};
    sprite.corners.push(corner);

    //Top Right
    corner = {x: sprite.x + sprite.width, y: sprite.y};
    sprite.corners.push(corner);

    //Bottom Left
    corner = {x: sprite.x, y: sprite.y + sprite.height};
    sprite.corners.push(corner);

    //Bottom Right
    corner = {x: sprite.x + sprite.width, y: sprite.y + sprite.height};
    sprite.corners.push(corner);

}

Sprite.prototype.bounceOffWalls = function () {

    if (this.x <= 0 || (this.x + this.width) >= this.targetCanvas.canvas.width) {
        this.x *= -0.9;
    }
    else if (this.y <= 0 || (this.y + this.height) >= this.targetCanvas.canvas.height) {
        this.y *= -0.9;
    }

};

//TO DO: Support for shift, enter etc.
Sprite.prototype.addKeyboardListener = function (button, targetFunction, parameter1, parameter2, parameter3) {

    var parameters = [];
    var keyboardListener = {};

    if(parameter1){
        parameters.push(parameter1);
        if(parameter2) {
            parameters.push(parameter2);
            if (parameter3) {
                parameters.push(parameter3);
            }
        }
    }

    keyboardListener.targetFunction = targetFunction;
    keyboardListener.parameters = parameters;

    this.controlArray.push({control: button.toASCII(), targetSprite: this, keyboardListener: keyboardListener});
};

Sprite.prototype.addBehaviour = function (behaviourFunction, parameter1, parameter2, parameter3) {

    var parameters = [];
    var behaviour = {};

    if(parameter1){
        parameters.push(parameter1);
        if(parameter2) {
            parameters.push(parameter2);
            if (parameter3) {
                parameters.push(parameter3);
            }
        }
    }
    behaviour.targetFunction = behaviourFunction;
    behaviour.parameters = parameters;

    this.behaviours.push(behaviour);

};

Sprite.prototype.removeBehaviour = function (behaviourFunction) {

    var indexNo = this.behaviours.indexOf(behaviourFunction);
    if (indexNo !== -1) {
        this.behaviours.splice(indexNo, 1);
    }

};

Sprite.prototype.executeBehaviours = function(){

    for(var i = 0; i <this.behaviours.length; i++){

        this.targetFunction = this.behaviours[i].targetFunction;

        if(this.behaviours[i].parameters.length >= 3) {
            this.targetFunction(this.behaviours[i].parameters[0], this.behaviours[i].parameters[1], this.behaviours[i].parameters[2]);
        }
        else if(this.behaviours[i].parameters.length == 2){
            this.targetFunction(this.behaviours[i].parameters[0], this.behaviours[i].parameters[1]);
        }
        else if(this.behaviours[i].parameters.length == 1){
            this.targetFunction(this.behaviours[i].parameters[0]);
        }
        else{
            this.targetFunction();
        }
    }

};