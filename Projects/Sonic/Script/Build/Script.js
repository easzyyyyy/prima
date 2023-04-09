"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    function timeBased(value) {
        return value * ƒ.Loop.timeFrameGame / 1000;
    }
    Script.timeBased = timeBased;
    // export function collide(node1: ƒ.Node, node2: ƒ.Node) {
    //     // console.log(node1.mtxWorld);
    //     // console.log(node2.mtxWorld);
    //     // console.log(node2.mtxWorldInverse);
    //     // mtxWorldInverse is not a function, how can we transform a point from world to local
    //     debugger
    //     return true;
    // }
    function collide(node1, node2) {
        const posWorld = node1.mtxLocal.translation;
        const pos = ƒ.Vector3.TRANSFORMATION(posWorld, node2.mtxWorldInverse, true);
        const isOnBlockHorrizontally = pos.x < 0.9 && pos.x > -0.9;
        const isOnBlockVertically = pos.y < 0.9 && pos.y > -0.9;
        if (isOnBlockHorrizontally) {
            if (pos.y < 1 && pos.y > 0) {
                node1.mtxLocal.translateY(1 - pos.y);
                return 'top';
            }
            if (pos.y < 0 && pos.y > -1) {
                node1.mtxLocal.translateY(-(1 + pos.y));
                return 'bottom';
            }
        }
        if (isOnBlockVertically) {
            if (pos.x < 1 && pos.x > 0) {
                node1.mtxLocal.translateX(1 - pos.x);
                return 'right';
            }
            if (pos.x < 0 && pos.x > -1) {
                node1.mtxLocal.translateX(-(1 + pos.x));
                return 'left';
            }
        }
        return null;
    }
    Script.collide = collide;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let sonic;
    let terrain;
    document.addEventListener("interactiveViewportStarted", start);
    // document.addEventListener("keydown", handleKeyboard);
    function start(_event) {
        viewport = _event.detail;
        const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
        sonic = new Script.Sprite(sonicNode, 'Sonic');
        // let cmpSonic: ƒ.ComponentTransform = sonic.getComponent(ƒ.ComponentTransform);
        // cmpSonic.mtxLocal.translateX(1);
        // Move the default camera
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.rotateY(180);
        viewport.camera.mtxPivot.translateX(-4.5);
        viewport.camera.mtxPivot.translateY(3.5);
        // Load terrain
        terrain = viewport.getBranch().getChildrenByName('Terrain')[0];
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // let timeStamp = _event.timeStamp;
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();
        // Make sonic move
        let sonicPos = sonic.getX();
        if (sonicPos > 9.2) {
            sonic.setX(0);
        }
        else if (sonicPos < -0.1) {
            sonic.setX(9.2);
        }
        // Control sonic
        // Right and Left
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
            sonic.speedX = 6;
        }
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
            sonic.speedX = -6;
        }
        else {
            sonic.speedX = 0;
        }
        // // Right and Left fun
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
        //   sonic.accX = 0.005;
        // } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
        //   sonic.accX = -0.005;
        // } else {
        //   sonic.accX = 0;
        //   sonic.speedX /= 1.1;
        // }
        // Jump
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE, ƒ.KEYBOARD_CODE.ARROW_UP])) {
            sonic.jump();
        }
        for (const block of terrain.getChildren()) {
            block;
            // if (collide(sonic.node, block)) {
            // }
        }
        sonic.move();
        sonic.anim();
        let tiles = viewport.getBranch().getChildrenByName("Terrain")[0].getChildren();
        for (let tile of tiles) {
            const collision = Script.collide(sonic.node, tile);
            if (collision === 'top') {
                sonic.isJumping = false;
                sonic.speedY = 0;
            }
            if (collision === 'bottom') {
                sonic.speedY = 0;
            }
            if (collision === 'right') {
                sonic.speedX = 0;
            }
            if (collision === 'left') {
                sonic.speedX = 0;
            }
        }
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Sprite {
        name = 'Sprite';
        speedX = 0;
        speedY = 0;
        accX = 0;
        accY = -30;
        isJumping = false;
        node;
        constructor(node, name) {
            this.node = node;
            this.name = name;
            // Change the Node scale in order to respect the Sonic ratio
            this.node.mtxLocal.scaleX(177 / 250);
        }
        getX() {
            return this.node.mtxLocal.translation.x;
        }
        getY() {
            return this.node.mtxLocal.translation.y;
        }
        getPos() {
            return this.node.mtxLocal.translation;
        }
        setX(x) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.x = x;
            this.node.mtxLocal.translation = newTranslation;
        }
        setY(y) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.y = y;
            this.node.mtxLocal.translation = newTranslation;
        }
        setPos(x, y) {
            let newTranslation = this.node.mtxLocal.translation;
            newTranslation.x = x;
            newTranslation.y = y;
            this.node.mtxLocal.translation = newTranslation;
        }
        /**
         * 1 = right, -1 = left
         * @returns side
         */
        getSide() {
            return this.node.mtxLocal.get()[0];
        }
        /**
         * 1 = right, -1 = left
         * @param side
         */
        setSide(side) {
            const material = this.node.getComponent(ƒ.ComponentMaterial);
            let newMtxLocal = material.mtxPivot.scaling;
            newMtxLocal.x = side;
            material.mtxPivot.scaling = newMtxLocal;
        }
        move() {
            this.speedX += Script.timeBased(this.accX);
            this.speedY += Script.timeBased(this.accY);
            // If the speed is negativ, sonic is going to the left so we change his side
            if (this.speedX < 0) {
                this.setSide(-1);
            }
            else if (this.speedX > 0) {
                this.setSide(1);
            }
            // Not abs because the side is changed for the material, not for the node
            this.node.mtxLocal.translateX(Script.timeBased(this.speedX));
            this.node.mtxLocal.translateY(Script.timeBased(this.speedY));
            // So sonic don't go under 1 in y
            // let posY = this.getY()
            // if (posY < 1) {
            //     this.setY(1);
            //     this.isJumping = false;
            //     this.speedY = 0;
            // }
        }
        anim() {
            // const animation = this.node.getComponent(ƒ.ComponentAnimator)
            // if (this.speedX !== 0 && animation.animation.name !== 'SonicRun') {
            //     this.node.removeComponent(animation)
            //     // this.node.addComponent(new ƒ.ComponentAnimator)
            // }
            // else if (animation.animation.name !== 'SonicIdle') {
            //     this.node.removeComponent(animation)
            //     // this.node.addComponent(new ƒ.ComponentAnimator)
            // }
        }
        jump() {
            if (!this.isJumping) {
                this.speedY = 10;
                this.isJumping = true;
            }
        }
    }
    Script.Sprite = Sprite;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map