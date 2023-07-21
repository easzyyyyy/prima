"use strict";
var Script;
(function (Script) {
    class Config {
        static path = "/prima/Projects/Karting/config.json";
        constructor() { }
        static async load() {
            const stringConfig = await (await fetch(this.path)).text();
            const jsonConfig = JSON.parse(stringConfig);
            return jsonConfig;
        }
    }
    Script.Config = Config;
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
        isLapValid;
        checkpoint;
        lapTime;
        bestTime;
        currentLapTime;
        constructor() {
            super();
            this.speed = 0;
            this.isLapValid = false;
            this.checkpoint = false;
            this.lapTime = 0;
            this.bestTime = 0;
            this.currentLapTime = 0;
            let vui = document.querySelector(".vui");
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
        view;
        lap;
        constructor(node) {
            super('Karting');
            this.node = node;
            this.geometry = this.node.getChildrenByName('Geometry')[0];
            this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);
            // TODO: Add configuration
            this.maxVelocity = Script.config.maxVelocity;
            this.currentVelocity = ƒ.Vector3.ZERO();
            this.accelerationForce = Script.config.accelerationForce; // Huge because of time based system
            this.maxRotationVelocity = Script.config.maxRotationVelocity;
            this.currentRotationVelocity = ƒ.Vector3.ZERO();
            this.rotationForce = Script.config.rotationForce; // Huge because of time based system
            this.view = Script.config.view;
            this.lap = new Script.Lap();
            this.lap.valid = false;
            // Choose first or third view
            if (this.view == "first") {
                this.firstPerson();
            }
            else {
                this.thirdPerson();
            }
            this.setupAudio();
            this.playEngineSound();
        }
        firstPerson() {
            const translation = Script.camera.mtxPivot.translation;
            const rotation = Script.camera.mtxPivot.rotation;
            Script.camera.attachToNode(this.geometry);
            // Move the default camera to first person
            translation.x = -2;
            translation.y = 1;
            translation.z = 0;
            rotation.y = 90;
            rotation.x = 0;
            Script.camera.mtxPivot.translation = translation;
            Script.camera.mtxPivot.rotation = rotation;
            this.view = "first";
        }
        thirdPerson() {
            const translation = Script.camera.mtxPivot.translation;
            const rotation = Script.camera.mtxPivot.rotation;
            Script.camera.attachToNode(this.geometry);
            // Move the default camera to third person
            translation.x = -10;
            translation.y = 4;
            translation.z = 0;
            rotation.y = 90;
            rotation.x = 20;
            Script.camera.mtxPivot.translation = translation;
            Script.camera.mtxPivot.rotation = rotation;
            this.view = "third";
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
            this.node.addComponent(cmpAudio);
            this.audio = cmpAudio;
        }
        playEngineSound() {
            // "/prima/Projects/Karting/Sounds/engine.mp3"
            const engineSound = new ƒ.Audio("/prima/Projects/Karting/Sounds/engine.mp3");
            this.audio.setAudio(engineSound);
            this.audio.play(true);
        }
        loop() {
            this.currentVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getVelocity(), this.node.mtxWorldInverse, false);
            this.currentRotationVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getAngularVelocity(), this.node.mtxWorldInverse, false);
            Script.gamestate.speed = Math.round(this.currentVelocity.magnitude);
            // @ts-ignore
            this.audio.playbackRate = 1 + Script.gamestate.speed / 8;
            this.updateLapInfo();
            this.control();
        }
        updateLapInfo() {
            const trackState = Script.track.checkOnTrack(this.node.mtxLocal.translation);
            switch (trackState) {
                case Script.TrackState.OFF_TRACK:
                    this.lap.valid = false;
                    Script.gamestate.isLapValid = false;
                    break;
                case Script.TrackState.START:
                    if (this.lap.start) {
                        this.lap.finish = true;
                        this.lap.finishTime = ƒ.Time.game.get();
                        Script.gamestate.lapTime = this.lap.valid && this.lap.getLapTime() || 0;
                        // Update best time
                        if ((Script.gamestate.lapTime != 0)
                            && (Script.gamestate.bestTime == 0 || Script.gamestate.lapTime < Script.gamestate.bestTime)) {
                            Script.gamestate.bestTime = Script.gamestate.lapTime;
                        }
                    }
                    this.lap = new Script.Lap();
                    this.lap.startTime = ƒ.Time.game.get();
                    Script.gamestate.isLapValid = true;
                    break;
                case Script.TrackState.CHECKPOINT:
                    this.lap.checkpoint = true;
                    Script.gamestate.checkpoint = true;
                    break;
            }
            const currentLapTime = Math.round(ƒ.Time.game.get() - this.lap.startTime) / 1000;
            Script.gamestate.currentLapTime = Script.gamestate.isLapValid && currentLapTime || 0;
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
    class Lap {
        start;
        finish;
        checkpoint;
        valid;
        startTime;
        finishTime;
        lapTime;
        constructor() {
            this.start = true;
            this.finish = false;
            this.checkpoint = false;
            this.valid = true;
            this.startTime = 0;
            this.finishTime = 0;
            this.lapTime = 0;
        }
        isLapValid() {
            this.valid = this.start && this.finish && this.checkpoint;
            return this.valid;
        }
        getLapTime() {
            if (this.isLapValid() && this.startTime != 0 && this.finishTime != 0) {
                this.lapTime = (this.finishTime - this.startTime) / 1000;
            }
            return Math.round(this.lapTime * 1000) / 1000;
        }
    }
    Script.Lap = Lap;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let TrackState;
    (function (TrackState) {
        TrackState[TrackState["ON_TRACK"] = 0] = "ON_TRACK";
        TrackState[TrackState["OFF_TRACK"] = 1] = "OFF_TRACK";
        TrackState[TrackState["CHECKPOINT"] = 2] = "CHECKPOINT";
        TrackState[TrackState["START"] = 3] = "START";
    })(TrackState = Script.TrackState || (Script.TrackState = {}));
    document.addEventListener("interactiveViewportStarted", start);
    // Restart the race
    document.addEventListener("keypress", (e) => {
        if (e.key == "r") {
            Script.track.placeKart();
        }
    });
    // Change view
    document.addEventListener("keypress", (e) => {
        if (e.key == "c") {
            // Toogle first or third view
            if (Script.karting.view == "first") {
                Script.karting.thirdPerson();
            }
            else {
                Script.karting.firstPerson();
            }
        }
    });
    async function start(_event) {
        Script.viewport = _event.detail;
        Script.graph = Script.viewport.getBranch();
        Script.camera = Script.viewport.camera;
        Script.gamestate = new Script.Gamestate();
        // Load configuration
        Script.config = await Script.Config.load();
        // See colliders
        Script.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;
        // Initialize karting
        const kartingNode = Script.graph.getChildrenByName("Karting")[0];
        Script.karting = new Script.Karting(kartingNode);
        // Initialize track
        const trackNode = Script.graph.getChildrenByName("Track")[0];
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
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SpectatorComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(SpectatorComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "SpectatorComponentScript added to ";
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
                    this.node.addEventListener("renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */, this.hndEvent);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
                case "renderPrepare" /* ƒ.EVENT.RENDER_PREPARE */:
                    this.anim();
                    break;
            }
        };
        anim() {
            if (!Script.gamestate?.bestTime)
                return;
            const cmpAnimator = this.node.getComponent(ƒ.ComponentAnimator);
            const animationName = Script.gamestate.bestTime < 12 && "SpectateAnimation" || "IdleAnimation";
            const animation = ƒ.Project.getResourcesByName(animationName)[0];
            cmpAnimator.playmode = ƒ.ANIMATION_PLAYMODE.LOOP;
            cmpAnimator.animation = animation;
        }
    }
    Script.SpectatorComponentScript = SpectatorComponentScript;
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
        // Used to check if the new color is different in the checkOnTrack function
        previousColor;
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
            // "/prima/Projects/Karting/Images/track_texture.jpg"
            await trackTexture.load("/prima/Projects/Karting/Images/track_texture.jpg");
            const trackCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), trackTexture);
            const trackMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, trackCoat);
            const cpmTrackMaterial = new ƒ.ComponentMaterial(trackMaterial);
            this.texture.addComponent(cpmTrackMaterial);
            const pickTexture = new ƒ.TextureImage();
            // "/prima/Projects/Karting/Images/track_pick.jpg"
            await pickTexture.load("/prima/Projects/Karting/Images/track_pick.jpg");
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
            Script.karting.rigidBody.setVelocity(ƒ.Vector3.ZERO());
            Script.karting.rigidBody.setAngularVelocity(ƒ.Vector3.ZERO());
        }
        checkOnTrack(pos) {
            const ray = new ƒ.Ray(ƒ.Vector3.Y(-1), pos, 1);
            let picks = ƒ.Picker.pickRay([Script.track.pick], ray, 0, 1);
            const pick = picks[0];
            const color = pick?.color?.getHex();
            if (color == this.previousColor)
                return Script.TrackState.ON_TRACK;
            this.previousColor = color;
            switch (color) {
                case "ffffffff":
                    return Script.TrackState.ON_TRACK;
                case "000000ff":
                    return Script.TrackState.OFF_TRACK;
                case "01f801ff":
                    return Script.TrackState.START;
                case "ff2700ff":
                    return Script.TrackState.CHECKPOINT;
                default:
                    return Script.TrackState.ON_TRACK;
            }
        }
    }
    Script.Track = Track;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map