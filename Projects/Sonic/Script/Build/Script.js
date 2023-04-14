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
        let collision = false;
        const isOnBlockHorrizontally = pos.x < 0.5 && pos.x > -0.5;
        const isOnBlockVertically = pos.y < 0.5 && pos.y > -0.5;
        if (isOnBlockHorrizontally) {
            if (pos.y < 1 && pos.y > 0) {
                node1.mtxLocal.translateY(1 - pos.y);
                collision = true;
            }
            if (pos.y < 0 && pos.y > -1) {
                node1.mtxLocal.translateY(-(1 + pos.y));
                collision = true;
            }
        }
        if (isOnBlockVertically) {
            if (pos.x < 1 && pos.x > 0) {
                node1.mtxLocal.translateX(-(1 - pos.x));
                collision = true;
            }
            if (pos.x < 0 && pos.x > -1) {
                node1.mtxLocal.translateX(-(1 + pos.x));
                collision = true;
            }
        }
        return collision;
    }
    Script.collide = collide;
    function cameraFollowSprite(sprite, viewport) {
        // Move camera on x only
        let pos = viewport.camera.mtxPivot.translation;
        pos.x = sprite.mtxLocal.translation.x;
        viewport.camera.mtxPivot.translation = pos;
        // Move camera on x and y
        // let pos = sprite.mtxLocal.translation
        // pos.z = viewport.camera.mtxPivot.translation.z
        // viewport.camera.mtxPivot.translation = pos
        // Display bugs
        // let mutator: ƒ.Mutator = sprite.mtxLocal.getMutator()
        // viewport.camera.mtxPivot.mutate({
        //     "translation": {
        //         "x": mutator.translation.x,
        //         "y": mutator.translation.y
        //     }
        // })
    }
    Script.cameraFollowSprite = cameraFollowSprite;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let game;
    let sonic;
    let terrain;
    document.addEventListener("interactiveViewportStarted", start);
    // document.addEventListener("keydown", handleKeyboard);
    function start(_event) {
        viewport = _event.detail;
        game = viewport.getBranch();
        // Setup music
        const music = game.getComponent(ƒ.ComponentAudio);
        const musicAudio = ƒ.Project.getResourcesByName('music.mp3')[0];
        music.setAudio(musicAudio);
        music.play(true);
        // Setup Sonic
        const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
        sonic = new Script.Sprite(sonicNode, 'Sonic');
        // Setup audio
        let audioListener = sonicNode.getComponent(ƒ.ComponentAudioListener);
        ƒ.AudioManager.default.listenWith(audioListener);
        ƒ.AudioManager.default.listenTo(game);
        ƒ.Debug.log("Audio:", ƒ.AudioManager.default);
        // Move the default camera
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.rotateY(180);
        viewport.camera.mtxPivot.translateY(5);
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
        // Move camera
        Script.cameraFollowSprite(sonic.node, viewport);
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
        // Jump
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE, ƒ.KEYBOARD_CODE.ARROW_UP])) {
            sonic.jump();
        }
        sonic.move();
        sonic.anim();
        // Test collisions
        let tiles = terrain.getChildren();
        for (let tile of tiles) {
            const collision = Script.collide(sonic.node, tile);
            if (collision) {
                sonic.isJumping = false;
                sonic.speedY = 0;
                sonic.speedX = 0;
            }
        }
        // Test if game is over
        if (sonic.getY() < -5) {
            sonic.playSound('death.mp3');
            sonic.setPos(0, 1);
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
        transform;
        visual;
        audio;
        constructor(node, name) {
            this.node = node;
            this.transform = this.node.getChildrenByName('SonicTransform')[0];
            this.visual = this.transform.getChildrenByName('SonicVisual')[0];
            this.audio = this.node.getComponent(ƒ.ComponentAudio);
            this.name = name;
            // Change the Node scale in order to respect the Sonic ratio
            this.node.mtxLocal.scaleX(177 / 250);
            // Because the spritesheet is on the wrong side
            this.transform.mtxLocal.rotateY(180);
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
         * right or left
         * @param {string} side
         */
        setSide(side) {
            let newRotation = this.node.mtxLocal.rotation;
            newRotation.y = side === 'right' ? 0 : 180;
            this.node.mtxLocal.rotation = newRotation;
        }
        move() {
            this.speedX += Script.timeBased(this.accX);
            this.speedY += Script.timeBased(this.accY);
            // If the speed is negativ, sonic is going to the left so we change his side
            if (this.speedX < 0) {
                this.setSide('left');
            }
            else if (this.speedX > 0) {
                this.setSide('right');
            }
            // abs because the side is changed for the node
            this.node.mtxLocal.translateX(Script.timeBased(Math.abs(this.speedX)));
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
            const currentAnimation = this.visual.getComponent(ƒ.ComponentAnimator);
            let nextAnimationName = null;
            if (this.isJumping) {
                nextAnimationName = 'SonicJump';
            }
            else if (this.speedX !== 0) {
                nextAnimationName = 'SonicRun';
            }
            else {
                nextAnimationName = 'SonicIdle';
            }
            if (currentAnimation.animation.name !== nextAnimationName) {
                const nextAnimation = ƒ.Project.getResourcesByName(nextAnimationName)[0];
                currentAnimation.animation = nextAnimation;
            }
        }
        playSound(name) {
            const sound = ƒ.Project.getResourcesByName(name)[0];
            this.audio.setAudio(sound);
            this.audio.play(true);
        }
        jump() {
            if (!this.isJumping) {
                this.speedY = 10;
                this.isJumping = true;
                this.playSound('jump.mp3');
            }
        }
    }
    Script.Sprite = Sprite;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map