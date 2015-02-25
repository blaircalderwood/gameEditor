var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var gravity = new b2Vec2(0, 0);

// Physics set up functions are based on the tutorial found at http://buildnewgames.com/box2dweb/

/** Create a new physics instance to run all physics related code
 *
 * @type {Function}
 */

var Physics = window.Physics = function (element, scale) {

    this.world = new b2World(gravity, true);
    this.element = element;
    this.context = element.getContext("2d");
    this.scale = scale || 20;
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

};

/** Get point in game world when canvas is clicked
 *
 * @param callback
 */

Physics.prototype.click = function (callback) {
    var self = this;

    function handleClick(e) {
        e.preventDefault();
        var point = {
            x: (e.offsetX || e.layerX) / self.scale,
            y: (e.offsetY || e.layerY) / self.scale
        };

        self.world.QueryPoint(function (fixture) {
            console.log(fixture);
            callback(fixture.GetBody(),
                fixture,
                point);
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

    this.listener.BeginContact = function (contact) {

    }
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

    this.body.CreateFixture(this.fixtureDef);

    this.definition.anchorPoint = details.anchorPoint || {
        x: this.body.GetWorldCenter().x,
        y: this.body.GetWorldCenter().y
    };

};

/** Set friction for use in top down games
 *
 * @param friction
 * @param angularDamping
 * @constructor
 */

Body.prototype.SetAirFriction = function (friction, angularDamping) {

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
    this.body.SetLinearVelocity(new b2Vec2(-velocity, 0));
};

/** Move an object right
 *
 * @param velocity
 */

Body.prototype.moveRight = function (velocity) {
    this.body.SetLinearVelocity(new b2Vec2(velocity, 0));
};

/** Move an object upwards
 *
 * @param velocity
 */

Body.prototype.moveUp = function (velocity) {
    this.body.SetLinearVelocity(new b2Vec2(0, -velocity));
};

/** Move an object downwards
 *
 * @param velocity
 */

Body.prototype.moveDown = function (velocity) {
    this.body.SetLinearVelocity(new b2Vec2(0, velocity));
};

/** Rotate towards another object
 *
 * @param target
 */

Body.prototype.rotateTowardsPoint = function (target) {

    this.body.SetAngle(tanAngle({x: target.x, y: target.y},
        {x: this.body.GetWorldCenter().x * physics.scale, y: this.body.GetWorldCenter().y * physics.scale}));

};

/** Move towards another object
 *
 * @param target
 * @param speed
 */

Body.prototype.moveTowardsPoint = function (target, speed) {


    if (target.inBounds(physicsCanvas.canvas) == true && target.inBounds(physicsCanvas.canvas) == true) {

        var vecLength = Math.sqrt((target.x * this.body.GetWorldCenter().x) + (target.x * this.body.GetWorldCenter().y));

        this.body.ApplyImpulse({
            x: ((target.x - this.body.GetPosition().x * physics.scale) / vecLength * speed),
            y: ((target.y - this.body.GetPosition().y * physics.scale) / vecLength * speed)
        }, this.body.GetWorldCenter());

    }

};

/** Set friction for top down games
 *
 * @param friction
 */

Body.prototype.setTopDownFriction = function (friction) {
    this.body.SetLinearDamping(friction);
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

Body.prototype.bulletBehaviour = function (velocity, angleInRads, destroyOnCollision) {

    this.body.SetAngle(angleInRads);
    this.body.SetLinearVelocity(velocity);

    if (destroyOnCollision) {

        //this.collision();
        /*this.listener.BeginContact = function(contact){
         destroyArray.push(this);
         }*/

    }
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
