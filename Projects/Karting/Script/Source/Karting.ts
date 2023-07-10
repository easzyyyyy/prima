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

        constructor(node: ƒ.Node) {
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
            camera.attachToNode(this.geometry);

            // Move the default camera to first person
            camera.mtxPivot.translateX(-2);
            camera.mtxPivot.translateY(1);
            camera.mtxPivot.translateZ(0);
            camera.mtxPivot.rotateY(90);
        }

        thirdPerson() {
            camera.attachToNode(this.geometry);

            // Move the default camera to third person
            camera.mtxPivot.translateX(-10);
            camera.mtxPivot.translateY(4);
            camera.mtxPivot.translateZ(0);
            camera.mtxPivot.rotateY(90);
            camera.mtxPivot.rotateX(20);
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
            cmpAudio.playbackRate = 2;
            this.node.addComponent(cmpAudio);
            this.audio = cmpAudio;
        }

        playEngineSound() {
            const engineSound: ƒ.Audio = new ƒ.Audio("/Sounds/engine.mp3");
            this.audio.setAudio(engineSound);
            this.audio.play(true);
            console.log(this.audio);
        }

        loop() {
            this.currentVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getVelocity(), this.node.mtxWorldInverse, false);
            this.currentRotationVelocity = ƒ.Vector3.TRANSFORMATION(this.rigidBody.getAngularVelocity(), this.node.mtxWorldInverse, false);

            gamestate.speed = Math.round(this.currentVelocity.magnitude)

            track.checkOnTrack(this.node.mtxLocal.translation);

            this.control();
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