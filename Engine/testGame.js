var firstBody, bullet;

function engineReady(physics){

    firstBody = new Body(physics, {
        shape: "circle",
        radius: 1,
        x: 400 / 20,
        y: 400 / 20,
        width: 2,
        height: 2,
        image: "../Images/sonic.png"
    });
    spriteArray.push(firstBody);

    firstBody.bounceOffWalls();

    firstBody.addKeyDownEvent("W", firstBody.setTopDownFriction, 0);
    firstBody.addKeyDownEvent("W", firstBody.moveTowardsPoint, [mouse, 10]);
    firstBody.addKeyDownEvent("A", firstBody.moveLeft, 10);
    firstBody.addKeyDownEvent("S", firstBody.moveDown, 10);
    firstBody.addKeyDownEvent("D", firstBody.moveRight, 10);

    firstBody.addKeyDownEvent("Y", shoot);

    firstBody.addKeyUpEvent("W", firstBody.setTopDownFriction, 0.5);

    firstBody.addEvent(firstBody.rotateTowardsPoint, mouseMoveListener, mouse);
    startEngine();

}

function shoot(){

    bullet = new Body(physics, {
        shape: "circle",
        radius: 0.2,
        x: firstBody.body.GetWorldCenter().x * 20,
        y: firstBody.body.GetWorldCenter().y * 20,
        height: 1,
        width: 1
    });
    spriteArray.push(bullet);

    bullet.addBehaviour(bullet.bulletBehaviour, 10, Math.PI / 2, false);

}

function logTest(logMessage){
    console.log(logMessage || "Log Test");
}