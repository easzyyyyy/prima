namespace Script {
    import ƒ = FudgeCore;

    export class Karting extends ƒ.Node {
        node: ƒ.Node;
        geometry: ƒ.Node;
        rigidBody: ƒ.ComponentRigidbody;
        audioListener: ƒ.ComponentAudioListener;
        audio: ƒ.ComponentAudio;

        maxVelocity: number;
        currentVelocity: ƒ.Vector3;
        accelerationForce: number;

        maxRotationVelocity: number;
        currentRotationVelocity: ƒ.Vector3;
        rotationForce: number;

        view: string;

        lap: Lap;

        constructor(node: ƒ.Node) {
            super('Karting');

            this.node = node;
            this.geometry = this.node.getChildrenByName('Geometry')[0];
            this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);

            // TODO: Add configuration
            this.maxVelocity = config.maxVelocity;
            this.currentVelocity = ƒ.Vector3.ZERO();
            this.accelerationForce = config.accelerationForce; // Huge because of time based system

            this.maxRotationVelocity = config.maxRotationVelocity;
            this.currentRotationVelocity = ƒ.Vector3.ZERO();
            this.rotationForce = config.rotationForce; // Huge because of time based system

            this.view = config.view;

            this.lap = new Lap();
            this.lap.valid = false;

            // Choose first or third view
            if (this.view == "first") {
                this.firstPerson();
            } else {
                this.thirdPerson();
            }

            this.setupAudio();
            this.playEngineSound();
        }

        firstPerson() {
            const translation = camera.mtxPivot.translation;
            const rotation = camera.mtxPivot.rotation;

            camera.attachToNode(this.geometry);

            // Move the default camera to first person
            translation.x = -2;
            translation.y = 1;
            translation.z = 0;
            rotation.y = 90;
            rotation.x = 0;

            camera.mtxPivot.translation = translation;
            camera.mtxPivot.rotation = rotation;

            this.view = "first";
        }

        thirdPerson() {
            const translation = camera.mtxPivot.translation;
            const rotation = camera.mtxPivot.rotation;

            camera.attachToNode(this.geometry);

            // Move the default camera to third person
            translation.x = -10;
            translation.y = 4;
            translation.z = 0;
            rotation.y = 90;
            rotation.x = 20;

            camera.mtxPivot.translation = translation;
            camera.mtxPivot.rotation = rotation;

            this.view = "third";
        }

        setupAudio() {
            // Setup audio
            let cmpListener: ƒ.ComponentAudioListener = new ƒ.ComponentAudioListener();
            this.node.addComponent(cmpListener);
            ƒ.AudioManager.default.listenWith(cmpListener);
            ƒ.AudioManager.default.listenTo(graph);
            this.audioListener = cmpListener;

            let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio();
            cmpAudio.loop = true;
            this.node.addComponent(cmpAudio);
            this.audio = cmpAudio;
        }

        playEngineSound() {
            // "/prima/Projects/Karting/Sounds/engine.mp3"

            const engineSound: ƒ.Audio = new ƒ.Audio("/prima/Projects/Karting/Sounds/engine.mp3");
            this.audio.setAudio(engineSound);
            this.audio.play(true);
        }

        loop() {
            this.currentVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getVelocity(), this.node.mtxWorldInverse, false);
            this.currentRotationVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getAngularVelocity(), this.node.mtxWorldInverse, false);

            gamestate.speed = Math.round(this.currentVelocity.magnitude)
            // @ts-ignore
            this.audio.playbackRate = 1 + gamestate.speed/8;
            this.updateLapInfo();
            this.control();
        }

        updateLapInfo() {
            const trackState = track.checkOnTrack(this.node.mtxLocal.translation);
            switch (trackState) {
                case TrackState.OFF_TRACK:
                    this.lap.valid = false;

                    gamestate.isLapValid = false;
                    break;

                case TrackState.START:
                    if (this.lap.start) {
                        this.lap.finish = true;
                        this.lap.finishTime = ƒ.Time.game.get();

                        gamestate.lapTime = this.lap.valid && this.lap.getLapTime() || 0;

                        // Update best time
                        if ((gamestate.lapTime != 0)
                            && (gamestate.bestTime == 0 || gamestate.lapTime < gamestate.bestTime)) {
                            gamestate.bestTime = gamestate.lapTime
                        }
                    }

                    this.lap = new Lap()
                    this.lap.startTime = ƒ.Time.game.get();

                    gamestate.isLapValid = true;
                    break;

                case TrackState.CHECKPOINT:
                    this.lap.checkpoint = true;
                    gamestate.checkpoint = true;
                    break;
            }

            const currentLapTime = Math.round(ƒ.Time.game.get() - this.lap.startTime)/1000
            gamestate.currentLapTime = gamestate.isLapValid && currentLapTime || 0;
        }

        control() {
            let acceleration = 0;
            let rotation = 0

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
                let force = new ƒ.Vector3(timeBased(acceleration), 0, 0);
                force = ƒ.Vector3.TRANSFORMATION(force, this.node.mtxLocal, false);
                this.rigidBody.applyForce(force);
            }

            // Set an angular velocity limit
            this.rigidBody.setAngularVelocity(ƒ.Vector3.SCALE(this.currentRotationVelocity, 0.9));
            if (Math.abs(this.currentRotationVelocity.y) < this.maxRotationVelocity) {
                let torque = new ƒ.Vector3(0, timeBased(rotation), 0);
                torque = ƒ.Vector3.TRANSFORMATION(torque, this.node.mtxLocal, false);
                this.rigidBody.applyTorque(torque);
            }
        }
    }
}