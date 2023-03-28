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
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let sonic;
    document.addEventListener("interactiveViewportStarted", start);
    // document.addEventListener("keydown", handleKeyboard);
    function start(_event) {
        viewport = _event.detail;
        const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
        sonic = new Sprite(sonicNode, 'Sonic');
        // let cmpSonic: ƒ.ComponentTransform = sonic.getComponent(ƒ.ComponentTransform);
        // cmpSonic.mtxLocal.translateX(1);
        // Move the default camera
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.rotateY(180);
        viewport.camera.mtxPivot.translateX(-4.5);
        viewport.camera.mtxPivot.translateY(3.5);
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
            sonic.speedX = 0.1;
        }
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
            sonic.speedX = -0.1;
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
        sonic.move();
    }
    class Sprite {
        name = 'Sprite';
        speedX = 0;
        speedY = 0;
        accX = 0;
        accY = -0.02;
        isJumping = false;
        node;
        constructor(node, name) {
            this.node = node;
            this.name = name;
        }
        getX() {
            return this.node.mtxLocal.get()[12];
        }
        getY() {
            return this.node.mtxLocal.get()[13];
        }
        getPos() {
            return {
                x: this.node.mtxLocal.get()[12],
                y: this.node.mtxLocal.get()[13]
            };
        }
        setX(x) {
            let newMtxLocal = this.node.mtxLocal.get();
            newMtxLocal[12] = x;
            this.node.mtxLocal.set(newMtxLocal);
        }
        setY(y) {
            let newMtxLocal = this.node.mtxLocal.get();
            newMtxLocal[13] = y;
            this.node.mtxLocal.set(newMtxLocal);
        }
        setPos(x, y) {
            let newMtxLocal = this.node.mtxLocal.get();
            newMtxLocal[12] = x;
            newMtxLocal[13] = y;
            this.node.mtxLocal.set(newMtxLocal);
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
            let newMtxLocal = this.node.mtxLocal.get();
            newMtxLocal[0] = side;
            this.node.mtxLocal.set(newMtxLocal);
        }
        move() {
            this.speedX += this.accX;
            this.speedY += this.accY;
            // If the speed is negativ, sonic is going to the left so we change his side
            if (this.speedX < 0) {
                this.setSide(-1);
            }
            else if (this.speedX > 0) {
                this.setSide(1);
            }
            // Abs because the side is automatically changed
            this.node.mtxLocal.translateX(Math.abs(this.speedX));
            this.node.mtxLocal.translateY(this.speedY);
            // So sonic don't go under 1 in y
            let posY = this.getY();
            if (posY < 1) {
                this.setY(1);
                this.isJumping = false;
            }
        }
        jump() {
            if (!this.isJumping) {
                this.speedY = 0.3;
                this.isJumping = true;
            }
        }
    }
})(Script || (Script = {}));
// import ƒ = FudgeCore;
// export class Sprite {}
//# sourceMappingURL=Script.js.map