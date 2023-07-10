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
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class Gamestate extends ƒ.Mutable {
        speed;
        constructor() {
            super();
            this.speed = 0;
            let vui = document.querySelector(".vui");
            console.log(vui);
            new ƒUi.Controller(this, vui);
        }
        reduceMutator(_mutator) {
        }
    }
    Script.Gamestate = Gamestate;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Karting extends ƒ.Node {
        node;
        geometry;
        rigidBody;
        audioListener;
        audio;
        maxVelocity;
        currentVelocity;
        accelerationForce;
        maxRotationVelocity;
        currentRotationVelocity;
        rotationForce;
        constructor(node) {
            super('Karting');
            this.node = node;
            this.geometry = this.node.getChildrenByName('Geometry')[0];
            this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);
            // TODO: Add configuration
            this.maxVelocity = 50;
            this.currentVelocity = ƒ.Vector3.ZERO();
            this.accelerationForce = 100000; // Huge because of time based system
            this.maxRotationVelocity = 5;
            this.currentRotationVelocity = ƒ.Vector3.ZERO();
            this.rotationForce = 1000; // Huge because of time based system
            this.thirdPerson();
            this.setupAudio();
            this.playEngineSound();
        }
        firstPerson() {
            Script.camera.attachToNode(this.geometry);
            // Move the default camera to first person
            Script.camera.mtxPivot.translateX(-2);
            Script.camera.mtxPivot.translateY(1);
            Script.camera.mtxPivot.translateZ(0);
            Script.camera.mtxPivot.rotateY(90);
        }
        thirdPerson() {
            Script.camera.attachToNode(this.geometry);
            // Move the default camera to third person
            Script.camera.mtxPivot.translateX(-10);
            Script.camera.mtxPivot.translateY(4);
            Script.camera.mtxPivot.translateZ(0);
            Script.camera.mtxPivot.rotateY(90);
            Script.camera.mtxPivot.rotateX(20);
        }
        setupAudio() {
            // Setup audio
            let cmpListener = new ƒ.ComponentAudioListener();
            this.node.addComponent(cmpListener);
            ƒ.AudioManager.default.listenWith(cmpListener);
            ƒ.AudioManager.default.listenTo(Script.graph);
            this.audioListener = cmpListener;
            let cmpAudio = new ƒ.ComponentAudio();
            cmpAudio.loop = true;
            cmpAudio.playbackRate = 2;
            this.node.addComponent(cmpAudio);
            this.audio = cmpAudio;
        }
        playEngineSound() {
            const engineSound = new ƒ.Audio("/Sounds/engine.mp3");
            this.audio.setAudio(engineSound);
            this.audio.play(true);
            console.log(this.audio);
        }
        loop() {
            this.currentVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getVelocity(), this.node.mtxWorldInverse, false);
            this.currentRotationVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getAngularVelocity(), this.node.mtxWorldInverse, false);
            Script.gamestate.speed = Math.round(this.currentVelocity.magnitude);
            Script.track.checkOnTrack(this.node.mtxLocal.translation);
            this.control();
        }
        control() {
            let acceleration = 0;
            let rotation = 0;
            // Move Karting
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])) {
                acceleration += this.accelerationForce;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])) {
                // Needs to brake stronger than accelerate
                // Can't go backward
                if (this.currentVelocity.x > 0) {
                    acceleration -= 1.5 * this.accelerationForce;
                }
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                rotation -= this.rotationForce;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                rotation += this.rotationForce;
            }
            // Limit the slide on the side
            let newVelocity = this.currentVelocity;
            newVelocity.z *= 0.5;
            newVelocity = ƒ.Vector3.TRANSFORMATION(newVelocity, this.node.mtxLocal, false);
            this.rigidBody.setVelocity(newVelocity);
            // Set a velocity limit
            if (this.currentVelocity.x < this.maxVelocity) {
                let force = new ƒ.Vector3(Script.timeBased(acceleration), 0, 0);
                force = ƒ.Vector3.TRANSFORMATION(force, this.node.mtxLocal, false);
                this.rigidBody.applyForce(force);
            }
            // Set an angular velocity limit
            this.rigidBody.setAngularVelocity(ƒ.Vector3.SCALE(this.currentRotationVelocity, 0.9));
            if (Math.abs(this.currentRotationVelocity.y) < this.maxRotationVelocity) {
                let torque = new ƒ.Vector3(0, Script.timeBased(rotation), 0);
                torque = ƒ.Vector3.TRANSFORMATION(torque, this.node.mtxLocal, false);
                this.rigidBody.applyTorque(torque);
            }
        }
    }
    Script.Karting = Karting;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        Script.viewport = _event.detail;
        Script.graph = Script.viewport.getBranch();
        Script.camera = Script.viewport.camera;
        Script.gamestate = new Script.Gamestate();
        console.log(Script.gamestate);
        // See colliders
        Script.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;
        // Initialize karting
        const kartingNode = Script.graph.getChildrenByName('Karting')[0];
        Script.karting = new Script.Karting(kartingNode);
        // Initialize track
        const trackNode = Script.graph.getChildrenByName('Track')[0];
        Script.track = new Script.Track(trackNode);
        await Script.track.loadTextures();
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        Script.karting.loop();
        ƒ.Physics.simulate(); // if physics is included and used
        Script.viewport.draw();
        // ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Track extends ƒ.Node {
        node;
        texture;
        pick;
        startNode;
        startPos;
        startAng;
        constructor(node) {
            super('Track');
            this.node = node;
            this.texture = this.node.getChildrenByName('Texture')[0];
            this.pick = this.node.getChildrenByName('Pick')[0];
            this.startNode = Script.graph.getChildrenByName('Start')[0];
            this.startPos = this.startNode.mtxLocal.translation.clone;
            this.startAng = this.startNode.mtxLocal.rotation.clone;
            this.placeStart();
            this.placeKart();
        }
        async loadTextures() {
            const trackTexture = new ƒ.TextureImage();
            await trackTexture.load("/Images/track_texture.jpg");
            const trackCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), trackTexture);
            const trackMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, trackCoat);
            const cpmTrackMaterial = new ƒ.ComponentMaterial(trackMaterial);
            this.texture.addComponent(cpmTrackMaterial);
            const pickTexture = new ƒ.TextureImage();
            await pickTexture.load("/Images/track_pick.jpg");
            const pickCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), pickTexture);
            const pickMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, pickCoat);
            const cpmPickMaterial = new ƒ.ComponentMaterial(pickMaterial);
            this.pick.addComponent(cpmPickMaterial);
        }
        placeStart() {
            this.startNode.mtxLocal.translation = this.startPos;
            this.startNode.mtxLocal.translateX(5);
            this.startNode.mtxLocal.rotation = this.startAng;
        }
        placeKart() {
            Script.karting.rigidBody.setPosition(this.startPos);
            Script.karting.rigidBody.setRotation(this.startAng);
        }
        checkOnTrack(pos) {
            const ray = new ƒ.Ray(ƒ.Vector3.Y(1), pos, 10);
            let picks = ƒ.Picker.pickRay([Script.track.node], ray, 1, 100);
            console.log(picks);
        }
    }
    Script.Track = Track;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map