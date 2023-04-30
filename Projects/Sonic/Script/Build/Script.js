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
    function collide(node1, node2) {
        let node1Pos = node1.mtxLocal.translation;
        let pos = ƒ.Vector3.TRANSFORMATION(node1Pos, node2.mtxWorldInverse, true);
        if (pos.y < 0.5 && pos.x > -0.5 && pos.x < 0.5) {
            pos.y = 0.5;
            pos = ƒ.Vector3.TRANSFORMATION(pos, node2.mtxWorld, true);
            node1.mtxLocal.translation = pos;
            return true;
        }
        return false;
    }
    Script.collide = collide;
    function cameraFollowSprite(sprite, viewport) {
        // Move camera on x only
        let difference = viewport.camera.mtxPivot.translation;
        difference.x = sprite.mtxLocal.translation.x;
        viewport.camera.mtxPivot.translation = difference;
        // Move camera on x and y
        // let difference = sprite.mtxLocal.translation
        // difference.z = viewport.camera.mtxPivot.translation.z
        // viewport.camera.mtxPivot.translation = difference
        // Displays bugs
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
    let floor;
    document.addEventListener("interactiveViewportStarted", start);
    // document.addEventListener("keydown", handleKeyboard);
    function start(_event) {
        viewport = _event.detail;
        game = viewport.getBranch();
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
        viewport.camera.mtxPivot.translateY(2);
        // Load Floor
        floor = viewport.getBranch().getChildrenByName('Floor')[0];
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // let timeStamp = _event.timeStamp;
        // ƒ.Physics.simulate();  // if physics is included and used
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
        const beforeMove = sonic.node.mtxLocal.translation;
        beforeMove;
        sonic.move();
        sonic.anim();
        const afterMove = sonic.node.mtxLocal.translation;
        afterMove;
        // Sonic collisions
        let tiles = floor.getChildren();
        for (let tile of tiles) {
            const collision = Script.collide(sonic.node, tile);
            if (collision) {
                sonic.isJumping = false;
                sonic.speedY = 0;
                sonic.speedX = 0;
            }
        }
        const afterCollide = sonic.node.mtxLocal.translation;
        afterCollide;
        // Test if game is over
        // if (sonic.getY() < -5) {
        //     sonic.playSound('death.mp3');
        //     sonic.setPos(0, 1);
        // }
        viewport.draw();
        ƒ.AudioManager.default.update();
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
            // Music
            const cmpMusic = this.node.getComponents(ƒ.ComponentAudio)[1];
            const musicAudio = ƒ.Project.getResourcesByName('music.mp3')[0];
            cmpMusic.setAudio(musicAudio);
            cmpMusic.play(true);
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