var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var gravity = new b2Vec2(0, 0);
var toDestroy = [];
var screenBounds = [];

// Physics set up functions are based on the tutorial found at http://buildnewgames.com/box2dweb/

/** Create a new physics instance to run all physics related code
 *
 * @type {Function}
 */

var Physics = window.Physics = function (element, scale) {

    this.world = new b2World(gravity, true);
    this.element = element;
    this.context = element.getContext("2d");
    this.scale = 20;
    this.dtRemaining = 0;
    this.stepAmount = 1 / 60;

};

/** Called every frame to execute all relevant physics events
 *
 * @param dt
 */

Physics.prototype.step = function (dt) {

    this.dtRemaining += dt;

    while (this.dtRemaining > this.stepAmount) {
        this.dtRemaining -= this.stepAmount;
        this.world.Step(this.stepAmount, 8, 3);
    }

    if (this.debugDraw) {
        this.world.DrawDebugData();
    }
    else {

        this.context.clearRect(0, 0, this.element.width, this.element.height);

        var object = this.world.GetBodyList();

        this.context.save();
        this.context.scale(this.scale, this.scale);

        while (object) {

            var body = object.GetUserData();

            if (body) body.draw(this.context);

            object = object.GetNext();

        }

        this.context.restore();

    }

    for(var i = 0; i < toDestroy.length; i ++){
        spriteArray.splice(spriteArray.indexOf(toDestroy[i]));
        physics.world.DestroyBody(toDestroy[i]);
    }
    toDestroy = [];

};

/** Get point in game world when canvas is clicked
 *
 * @param callback
 */

Physics.prototype.click = function (callback) {
    var self = this;

    function handleClick(e) {

        //e.preventDefault();
        var point = {
            x: (e.offsetX || e.layerX) / self.scale,
            y: (e.offsetY || e.layerY) / self.scale
        };
        console.log(point);
        self.world.QueryPoint(function (fixture) {
            console.log(fixture.GetBody());
            /*callback(fixture.GetBody(),
                fixture,
                point);*/
        }, point);
    }

    this.element.addEventListener("mousedown", handleClick);
    this.element.addEventListener("touchstart", handleClick);

};

/** Execute function upon collision with another object
 *
 */

Physics.prototype.collision = function () {


    this.listener = new Box2D.Dynamics.b2ContactListener();

    this.listener.PostSolve = function (contact, impulse) {

        var contactOne = contact.GetFixtureA().GetBody().GetUserData();
        var contactTwo = contact.GetFixtureB().GetBody().GetUserData();

        if(screenBounds.indexOf(contactOne) == -1 && screenBounds.indexOf(contactTwo) == -1) {
            contactOne.checkCollisions(contactTwo);
            contactTwo.checkCollisions(contactOne);
            console.log(contactOne);
            console.log(contactTwo);

        }

        //listen(contact.checkCollisions)
    };

    this.world.SetContactListener(this.listener);

};

/** Show debug graphics
 *
 */

Physics.prototype.debug = function () {

    this.debugDraw = new b2DebugDraw();
    this.debugDraw.SetSprite(this.context);
    this.debugDraw.SetDrawScale(this.scale);
    this.debugDraw.SetFillAlpha(0.3);
    this.debugDraw.SetLineThickness(1.0);
    this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    this.world.SetDebugDraw(this.debugDraw);

};

Physics.prototype.addScreenBounds = function(){

    var screenWidth = (physicsCanvas.canvas.width) / physics.scale;
    var screenHeight = (physicsCanvas.canvas.height) / physics.scale;

    screenBounds = [new Body(physics, { type: "static", x: screenWidth / 2, y: 0.1, height: 0.5, width: screenWidth}),
    new Body(physics, { type: "static", x: 0.1, y: screenHeight / 2, height: screenHeight,  width: 0.5 }),
    new Body(physics, { type: "static", x: screenWidth, y: screenHeight / 2, height: screenHeight,  width: 0.5}),
    new Body(physics, { type: "static", x: screenWidth / 2, y: screenHeight, height: 0.5, width: screenWidth })];

};

//Body Protos

/** Set up new body element for physics manipulation
 *
 * @type {Function}
 */

var Body = window.Body = function (physics, details) {

    this.details = details = details || {};

    this.definition = new b2BodyDef();

    for (var k in this.definitionDefaults) {
        this.definition[k] = details[k] || this.definitionDefaults[k];
    }

    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;

    this.body = physics.world.CreateBody(this.definition);

    this.fixtureDef = new b2FixtureDef();

    for (var l in this.fixtureDefaults) {
        this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }

    details.shape = details.shape || this.defaults.shape;

    switch (details.shape) {

        case "circle":
            details.radius = details.radius || this.defaults.radius;
            this.fixtureDef.shape = new b2CircleShape(details.radius);
            break;

        case "polygon":
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsArray(details.points, details.points.length);
            break;

        case "block":
        default :
            details.width = details.width || this.defaults.width;
            details.height = details.height || this.defaults.height;

            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsBox(details.width / 2, details.height / 2);
            break;

    }

    this.behaviours = details.behaviours || [];
    this.controlArray = details.controlArray || [];
    this.collisionArray = details.collisionArray || [];

    this.body.CreateFixture(this.fixtureDef);

    this.definition.anchorPoint = details.anchorPoint || {
        x: this.body.GetWorldCenter().x,
        y: this.body.GetWorldCenter().y
    };

};

Body.prototype.contact = function(){};

Body.prototype.checkCollisions = function(collidingObject){

    if(this.contactFunctions) {
        for (var j = 0; j < this.contactFunctions.length; j++) {
            this.contactFunctions[j].apply(this);
        }
    }

    for(var i = 0; i < this.collisionArray.length; i ++){

        if(this.collisionArray[i].collidingObject == collidingObject){
            //var listeningFunction = {functions: this.collisionArray[i].targetFunction, bodyObject: this};
            //listeningFunction.targetFunction.parameterArray = collidingObject.parameterArray;
            /*this.collisionArray.collided = {functions: this.targetFunction, bodyObject: this};
            listen(listeningFunction);*/
            console.log(this);
            this.collisionArray[i].targetFunction.apply(this, this.collisionArray[i].parameterArray);

        }
    }

};

Body.prototype.collision = function(){

    console.log("COLLIDED");

};

/** Set friction for use in top down games
 *
 * @param friction
 * @param angularDamping
 * @constructor
 */

Body.prototype.SetAirFriction = function (friction, angularDamping) {

    this.body.SetAwake(true);

    if (friction) {
        this.body.GetLinearVelocity().x *= friction;
        this.body.GetLinearVelocity().y *= friction;
    }

    if (angularDamping) {
        this.body.SetAngularVelocity(this.body.GetAngularVelocity() * angularDamping);
    }

};

/** Set maximum object speed
 *
 * @param threshold
 * @constructor
 */

Body.prototype.SetMovementThreshold = function (threshold) {

    if (!this.oldVel) {
        this.oldVel = {x: 0, y: 0};
    }

    var linearX = Math.abs(this.body.GetLinearVelocity().x);
    var linearY = Math.abs(this.body.GetLinearVelocity().y);

    if (linearX < threshold && linearX < Math.abs(this.oldVel.x) && linearY < threshold && linearY < Math.abs(this.oldVel.y)) {
        this.body.SetLinearVelocity(new b2Vec2(0, 0));
    }

    this.oldVel.x = linearX;
    this.oldVel.y = linearY;

};

/** Set maximum object rotation
 *
 * @param threshold
 * @constructor
 */

Body.prototype.SetAngularThreshold = function (threshold) {

    if (!this.oldAngleVel) {
        this.oldAngleVel = 0;
    }

    var angleVel = Math.abs(this.body.GetAngularVelocity());

    if (angleVel < threshold && angleVel < Math.abs(this.oldAngleVel)) {
        this.body.SetAngularVelocity(0);
    }

    this.oldAngleVel = angleVel;

};

/** Move an object left
 *
 * @param velocity
 */

Body.prototype.moveLeft = function (velocity) {
    this.body.SetAwake(true);
    this.body.SetLinearVelocity(new b2Vec2(-velocity, 0));
};

/** Move an object right
 *
 * @param velocity
 */

Body.prototype.moveRight = function (velocity) {
    this.body.SetAwake(true);
    this.body.SetLinearVelocity(new b2Vec2(velocity, 0));
};

/** Move an object upwards
 *
 * @param velocity
 */

Body.prototype.moveUp = function (velocity) {
    this.body.SetAwake(true);
    this.body.SetLinearVelocity(new b2Vec2(0, -velocity));
};

/** Move an object downwards
 *
 * @param velocity
 */

Body.prototype.moveDown = function (velocity) {
    this.body.SetAwake(true);
    this.body.SetLinearVelocity(new b2Vec2(0, velocity));
};

/** Rotate towards another object
 *
 * @param target
 */

Body.prototype.rotateTowardsPoint = function (target) {

    this.body.SetAngle(tanAngle({x: target.body.GetWorldCenter().x * physics.scale, y: target.body.GetWorldCenter().y * physics.scale},
        {x: this.body.GetWorldCenter().x * physics.scale, y: this.body.GetWorldCenter().y * physics.scale}));

};

/** Rotate towards the current mouse position.
 *
 */

Body.prototype.rotateTowardsMouse = function () {

    this.body.SetAngle(tanAngle(mouse, {x: this.body.GetWorldCenter().x, y: this.body.GetWorldCenter().y}));

};

/** Move towards another object
 *
 * @param target
 * @param speed
 */

Body.prototype.moveTowardsPoint = function (target, speed) {

    var vector = new b2Vec2((target.body.GetWorldCenter().x - this.body.GetWorldCenter().x) * physics.scale * 50,
        (target.body.GetWorldCenter().y - this.body.GetWorldCenter().y) * physics.scale * 50);

    if (target.inBounds(physicsCanvas.canvas) == true && target.inBounds(physicsCanvas.canvas) == true) {

        var vecLength = Math.sqrt((target.x * this.body.GetWorldCenter().x) + (target.x * this.body.GetWorldCenter().y));

        this.body.ApplyImpulse(vector, this.body.GetWorldCenter());

    }

};

Body.prototype.moveTowardsMouse = function (speed) {

    var vector = new b2Vec2((mouse.x - this.body.GetWorldCenter().x) * physics.scale * speed,
        (mouse.y - this.body.GetWorldCenter().y) * physics.scale * speed);

        this.body.ApplyImpulse(vector, this.body.GetWorldCenter());

};

/** Set friction for top down games
 *
 * @param friction
 */

Body.prototype.setTopDownFriction = function (friction) {
    this.body.SetLinearDamping(friction);
};

Body.prototype.destroy = function(){
    toDestroy.push(this.body);
};

Body.prototype.copyObject = function(x, y){

    spriteArray.push(new Body(physics, {type: 'dynamic', shape: this.details.shape, radius: this.details.radius,
        x: x / physics.scale, y: y / physics.scale, width: this.details.width, height: this.details.height, image: this.details.image}));

    for(var i = 0; i < eventsArray.length; i ++){
        if(eventsArray[i].bodyObject.details.image == this.details.image && eventsArray[i].functionName !== "copyObject"){
            console.log(eventsArray[i].functionName);
            spriteArray[spriteArray.length -1].addEvent(eventsArray[i].functionName, eventsArray[i].listener, eventsArray[i].parameterArray);
            break;
        }
    }

};

Body.prototype.posFromServer = function(serverURL){

    console.log(this.body);

    var newBody = this;

    generalFunctions.getAjax(serverURL + "getPos?objectID=" + spriteArray.indexOf(this), function(data){

        if(data !== "Object not found") {

            data = JSON.parse(data);
            console.log(Number(data.x));
            newBody.body.SetPosition(new b2Vec2(Number(data.x), Number(data.y)));
            //this.body.SetPosition(Number(data.y));

        }
        console.log(data);

    })

};

Body.prototype.posToServer = function(serverURL){

    generalFunctions.getAjax(serverURL + "putPos?objectID=" + spriteArray.indexOf(this) + "&x=" + this.body.GetWorldCenter().x + "&y=" + this.body.GetWorldCenter().y, function(data){
        console.log(data);
    });
};

Body.prototype.posFromServer = function(serverURL){

    generalFunctions.getAjax(serverURL + "/getPos?objectId=" + spriteArray.indexOf(this), function(data){

        this.body.x = data.x;
        this.body.y = data.y;

    })

};

Body.prototype.posToServer = function(serverURL){

    generalFunctions.getAjax(serverURL + "/putPos?objectId=" + spriteArray.indexOf(this) + "&x=" + this.body.x + "&y=" + this.body.y, function(data){
        console.log("Position submitted to server");
    });
};

/** Default body prototype values for use if no detail is given
 *
 * @type {{shape: string, width: number, height: number, radius: number}}
 */

Body.prototype.defaults = {

    shape: "block",
    width: 2,
    height: 2,
    radius: 1

};

Body.prototype.fixtureDefaults = {

    density: 50,
    friction: 1,
    restitution: 0.5

};

Body.prototype.definitionDefaults = {

    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: false

};

/** Draw a given physics body on screen
 *
 * @param context
 */

Body.prototype.draw = function (context) {

    var position = this.body.GetPosition();
    var angle = this.body.GetAngle();

    context.save();

    context.translate(position.x, position.y);
    context.rotate(angle);

    if (this.details.color) {
        context.fillStyle = this.details.color;

        switch (this.details.shape) {
            case "circle":
                context.beginPath();
                context.arc(0, 0, this.details.radius, 0, Math.PI * 2);
                context.fill();
                break;

            case "polygon":
                var points = this.details.points;
                context.beginPath();
                context.moveTo(points[0].x, points[0].y);

                for (var i = 1; i < points.length; i++) {
                    context.lineTo(points[i].x, points[i].y);
                }

                context.fill();
                break;

            case "block":
                context.fillRect(-this.details.width / 2, -this.details.height / 2, this.details.width, this.details.height);
                break;

            default:
                break;


        }
    }

    if (this.details.image) {

        context.drawImage(this.details.image, -this.details.width / 2, -this.details.height / 2,
            this.details.width,
            this.details.height);

        /*sprite.onload = function() {

         console.log("WORKING");
         context.drawImage(sprite, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);


         }*/

    }

    context.restore();

};

/** Bounce an object of in game walls
 *
 */

Body.prototype.bounceOffWalls = function () {

    new Body(physics, {type: "static", x: 0, y: 0, height: 50, width: 2});
    new Body(physics, {type: "static", x: 51, y: 0, height: 50, width: 2});
    new Body(physics, {type: "static", x: 0, y: 0, height: 2, width: 120});
    new Body(physics, {type: "static", x: 0, y: 25, height: 2, width: 120});

};

/** Give an object a bullet behaviour for higher accuracy collision checking
 *
 * @param velocity
 * @param angleInRads
 * @param destroyOnCollision
 */

Body.prototype.shootTowardsMouse = function (speed) {

    var target = mouse;
    var bulletWidth = bulletImage.width / physics.scale;
    var tanAngles = tanAngle({x: this.body.GetWorldCenter().x, y: this.body.GetWorldCenter().y}, target) + (Math.PI / 2);
    var xCoord = (Math.cos(tanAngles) * (this.details.radius + (bulletWidth / 2) + 0.01)) + this.body.GetWorldCenter().x;
    var yCoord = (Math.sin(tanAngles) * (this.details.radius +  + (bulletWidth / 2) + 0.01)) + this.body.GetWorldCenter().y;

    var bullet = new Body(physics, {type: 'dynamic', shape: "circle", radius: bulletWidth / 2,
        x: xCoord, y: yCoord, width: bulletWidth, height: bulletImage.height / physics.scale, image: bulletImage, bullet: true});

    if(target == mouse)bullet.moveTowardsMouse(speed);
    else bullet.moveTowardsPoint(target, speed);

    bullet.isBullet = true;
    spriteArray.push(bullet);

    var newLength = Number(spriteArray.length - 1);
    spriteArray[newLength].addEvent('destroy', spriteArray[newLength].contact);

};

/** Add a behaviour (e.g. turret) to a given object
 *
 * @param behaviourFunction
 * @param parameter1
 * @param parameter2
 * @param parameter3
 */

Body.prototype.addBehaviour = function (behaviourFunction, parameter1, parameter2, parameter3) {

    var parameters = [];
    var behaviour = {};

    if (parameter1) {
        parameters.push(parameter1);
        if (parameter2) {
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

/** Remove a behaviour from a given object
 *
 * @param behaviourFunction
 */

Body.prototype.removeBehaviour = function (behaviourFunction) {

    var indexNo = this.behaviours.indexOf(behaviourFunction);
    if (indexNo !== -1) {
        this.behaviours.splice(indexNo, 1);
    }

};

/** Execute any object behaviours
 *
 */
Body.prototype.executeBehaviours = function () {

    for (var i = 0; i < this.behaviours.length; i++) {

        this.targetFunction = this.behaviours[i].targetFunction;

        if (this.behaviours[i].parameters.length >= 3) {
            this.targetFunction(this.behaviours[i].parameters[0], this.behaviours[i].parameters[1], this.behaviours[i].parameters[2]);
        }
        else if (this.behaviours[i].parameters.length == 2) {
            this.targetFunction(this.behaviours[i].parameters[0], this.behaviours[i].parameters[1]);
        }
        else if (this.behaviours[i].parameters.length == 1) {
            this.targetFunction(this.behaviours[i].parameters[0]);
        }
        else {
            this.targetFunction();
        }
    }

};
