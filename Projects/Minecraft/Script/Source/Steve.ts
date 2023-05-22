namespace Script {
    import ƒ = FudgeCore;

    export class Steve {
        isGrounded: boolean = false;
        state: string = "Idle";
        node: ƒ.Node = null;
        geometry: ƒ.Node = null;

        constructor(node: ƒ.Node) {
            this.node = node;
            this.geometry = this.node.getChildrenByName("Geometry")[0]

            // this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            // this.addComponent(new ƒ.ComponentMesh(Block.mesh));
            // this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CAPSULE));

            const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
            cmpRigidBody.effectRotation = ƒ.Vector3.Y();
            cmpRigidBody.dampTranslation = 1;
            cmpRigidBody.dampRotation = 1;
            cmpRigidBody.friction = 0;
            cmpRigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
                this.collides(_event, this)
            })

            let cmpPick: ƒ.ComponentPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            this.node.addComponent(cmpPick);

            this.setCamera();
        }

        collides(_event: ƒ.EventPhysics, steve: Steve) {
            // @ts-ignore
            steve.isGrounded = true;

            // Dispatch event and custom event example
            // const customEvent: CustomEvent = new CustomEvent('steveCollided', {bubbles: true, detail: steve.mtxWorld.translation})
            // this.dispatchEvent(customEvent)

            // const vectorCollision: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(_event.collisionPoint, steve.mtxWorld.translation);
            // if (Math.abs(vectorCollision.x) <= 0.1 && Math.abs(vectorCollision.z) <= 0.1 && vectorCollision.y < 0) {

            // }
        }

        setCamera() {
            // const cameraNode = new ƒ.Node("CameraNode");
            viewport.camera.attachToNode(this.geometry);

            // cameraNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4));

            // cameraNode.addComponent(new ƒ.ComponentRigidbody(10, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE));
            // const cameraRigidBody = cameraNode.getComponent(ƒ.ComponentRigidbody);

            // this.node.addChild(cameraNode);

            // Attach camera to Steve
            // const steveRigidBody = this.getComponent(ƒ.ComponentRigidbody);
            // this.addComponent(new ƒ.JointPrismatic);
            // const steveJoint = this.getComponent(ƒ.JointPrismatic);
            // steveJoint.connectNode(cameraNode);

            // Move the default camera
            viewport.camera.mtxPivot.translateY(0);
            viewport.camera.mtxPivot.translateZ(-5);
            // viewport.camera.mtxPivot.rotateX(60);
        }

        animate() {
            const cmpAnimator = this.geometry.getComponent(ƒ.ComponentAnimator);
            const animation = ƒ.Project.getResourcesByName(this.state)[0] as ƒ.Animation;

            if (cmpAnimator.animation != animation) {
                if (this.state == "Jump") {
                    cmpAnimator.playmode = ƒ.ANIMATION_PLAYMODE.PLAY_ONCE;
                    cmpAnimator.animation = animation;
                } else if (this.isGrounded) {
                    cmpAnimator.playmode = ƒ.ANIMATION_PLAYMODE.LOOP;
                    cmpAnimator.animation = animation;
                }
            }
        }

        control() {
            const rigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);

            let movementSpeed = 6;
            let horizontalRotationSpeed = 5;
            let xVelocity = 0;
            let yVelocity = 0
            let zVelocity = 0;
            let yRotationVelocity = 0;

            this.state = "Idle";

            // Move Steve
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                xVelocity -= movementSpeed;
                this.state = "Walk";
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                xVelocity += movementSpeed;
                this.state = "Walk";
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) {
                zVelocity += movementSpeed;
                this.state = "Walk";
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
                zVelocity -= movementSpeed;
                this.state = "Walk";
            }

            // Look left and right
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                yRotationVelocity -= horizontalRotationSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                yRotationVelocity += horizontalRotationSpeed;
            }

            // Look up and down
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) {
                viewport.camera.mtxPivot.rotateX(-1);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) {
                viewport.camera.mtxPivot.rotateX(1);
            }

            // Jump
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
                if (this.isGrounded) {
                    yVelocity += 5;
                    this.isGrounded = false;
                    this.state = "Jump";
                }
            }

            const currentVelocity = rigidBody.getVelocity();
            let newVelocity = new ƒ.Vector3(xVelocity, 0, zVelocity);
            newVelocity = ƒ.Vector3.TRANSFORMATION(newVelocity, this.geometry.mtxLocal, false)
            newVelocity.y = currentVelocity.y + yVelocity
            rigidBody.setVelocity(newVelocity);

            let newRotation = new ƒ.Vector3(0, yRotationVelocity, 0);
            rigidBody.setAngularVelocity(newRotation);
        }
    }
}
