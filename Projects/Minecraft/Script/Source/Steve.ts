namespace Script {
    import ƒ = FudgeCore;

    export class Steve extends ƒ.Node {
        static mesh: ƒ.MeshCube = new ƒ.MeshCube("SteveMesh");
        static material: ƒ.Material = new ƒ.Material("SteveMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive());

        constructor(position: ƒ.Vector3, color: ƒ.Color) {
            super("Steve");
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            this.addComponent(new ƒ.ComponentMesh(Block.mesh));

            this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CAPSULE));
            this.getComponent(ƒ.ComponentRigidbody).effectRotation = ƒ.Vector3.Y();

            let cmpMaterial = new ƒ.ComponentMaterial(Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);

            let cmpPick: ƒ.ComponentPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            this.addComponent(cmpPick);

            this.scale();
            this.setCamera();
        }

        scale() {
            this.getComponent(ƒ.ComponentMesh).mtxPivot.scaleX(0.5);
            this.getComponent(ƒ.ComponentMesh).mtxPivot.scaleZ(0.5);
            this.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(2);

            // this.getComponent(ƒ.ComponentRigidbody).mtxPivot.scaleX(0.5);
            // this.getComponent(ƒ.ComponentRigidbody).mtxPivot.scaleY(0.5);
            // this.getComponent(ƒ.ComponentRigidbody).mtxPivot.scaleZ(0.5);
        }

        setCamera() {
            // Attach camera to Steve
            viewport.camera.attachToNode(this);

            // Move the default camera
            viewport.camera.mtxPivot.translateY(1);
            viewport.camera.mtxPivot.rotateX(60);
        }

        control() {
            const rigidBody = this.getComponent(ƒ.ComponentRigidbody);

            let movementSpeed = 6;
            let horizontalRotationSpeed = 5;
            let verticalRotationSpeed = 2;
            let xVelocity = 0;
            let yVelocity = 0
            let zVelocity = 0;
            let yRotationVelocity = 0;
            let xRotationVelocity = 0;

            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                xVelocity -= movementSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                xVelocity += movementSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) {
                zVelocity += movementSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
                zVelocity -= movementSpeed;
            }

            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                yRotationVelocity -= horizontalRotationSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                yRotationVelocity += horizontalRotationSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) {
                xRotationVelocity -= verticalRotationSpeed;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) {
                xRotationVelocity += verticalRotationSpeed;
            }

            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
                if (Math.abs(rigidBody.getVelocity().y) <= 0.1) {
                    yVelocity += 5;
                }
            }

            const currentVelocity = rigidBody.getVelocity();
            let newVelocity = new ƒ.Vector3(xVelocity, 0, zVelocity);
            newVelocity = ƒ.Vector3.TRANSFORMATION(newVelocity, this.mtxLocal, false)
            newVelocity.y = currentVelocity.y + yVelocity
            rigidBody.setVelocity(newVelocity);

            let newRotation = new ƒ.Vector3(xRotationVelocity, 0, 0);
            newRotation = ƒ.Vector3.TRANSFORMATION(newRotation, this.mtxLocal, false);
            newRotation.y = yRotationVelocity;
            rigidBody.setAngularVelocity(newRotation);
        }
    }
}