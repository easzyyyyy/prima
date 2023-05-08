"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Block extends ƒ.Node {
        static mesh = new ƒ.MeshCube("BlockMesh");
        static material = new ƒ.Material("BlockMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive());
        constructor(position, color) {
            super("Block");
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            this.addComponent(new ƒ.ComponentMesh(Block.mesh));
            this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE));
            let cmpMaterial = new ƒ.ComponentMaterial(Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);
            let cmpPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            // cmpPick.pick = ƒ.PICK.RADIUS;
            this.addComponent(cmpPick);
        }
    }
    Script.Block = Block;
})(Script || (Script = {}));
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
    function createMap(xSize, ySize, zSize, graph) {
        for (let i = 0; i < xSize; i++) {
            for (let j = 0; j < ySize; j++) {
                for (let k = 0; k < zSize; k++) {
                    const position = new ƒ.Vector3(i, j, k);
                    const color = new ƒ.Color(i / xSize, j / ySize, k / zSize);
                    const block = new Script.Block(position, color);
                    graph.addChild(block);
                }
            }
        }
    }
    Script.createMap = createMap;
    function getSortedPicksByCamera(_event) {
        let picks = ƒ.Picker.pickViewport(Script.viewport, new ƒ.Vector2(_event.clientX, _event.clientY));
        picks.sort((_a, _b) => _a.zBuffer - _b.zBuffer);
        return picks;
    }
    Script.getSortedPicksByCamera = getSortedPicksByCamera;
    function removeBlock(block) {
        block.getParent().removeChild(block);
    }
    Script.removeBlock = removeBlock;
    function placeBlock(parent, position, color) {
        const newBlock = new Script.Block(position, color);
        parent.addChild(newBlock);
    }
    Script.placeBlock = placeBlock;
    function interactWithBlock(_event) {
        const nearestPick = getSortedPicksByCamera(_event)[0];
        const block = nearestPick?.node;
        if (!block)
            return;
        switch (_event.button) {
            case 0:
                removeBlock(block);
                break;
            case 2:
                const position = ƒ.Vector3.SUM(block.mtxLocal.translation, nearestPick.normal);
                const color = new ƒ.Color(255, 0, 0);
                placeBlock(block.getParent(), position, color);
                break;
            default:
                break;
        }
        Script.viewport.draw();
    }
    Script.interactWithBlock = interactWithBlock;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    // @ts-ignore
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        Script.viewport = _event.detail;
        // View the colliders wireframe
        Script.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;
        // viewport.camera.mtxPivot.rotateY(-45);
        // viewport.camera.mtxPivot.translateX(2.5);
        // viewport.camera.mtxPivot.translateY(2.5);
        // viewport.camera.mtxPivot.translateZ(-15);
        // Create map
        Script.createMap(5, 5, 5, Script.viewport.getBranch());
        // Create Steve
        const position = new ƒ.Vector3(1, 10, 1);
        const color = new ƒ.Color(0, 0, 255);
        Script.steve = new Script.Steve(position, color);
        Script.viewport.getBranch().addChild(Script.steve);
        // @ts-ignore
        Script.viewport.canvas.addEventListener("pointerdown", Script.interactWithBlock);
        // Do not display the context menu on right click
        Script.viewport.canvas.addEventListener("contextmenu", (_event) => {
            _event.preventDefault();
            return false;
        });
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // Start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        Script.steve.control();
        ƒ.Physics.simulate(); // If physics is included and used
        Script.viewport.draw();
        // ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Steve extends ƒ.Node {
        static mesh = new ƒ.MeshCube("SteveMesh");
        static material = new ƒ.Material("SteveMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive());
        constructor(position, color) {
            super("Steve");
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            this.addComponent(new ƒ.ComponentMesh(Script.Block.mesh));
            this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CAPSULE));
            this.getComponent(ƒ.ComponentRigidbody).effectRotation = ƒ.Vector3.Y();
            let cmpMaterial = new ƒ.ComponentMaterial(Script.Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);
            let cmpPick = new ƒ.ComponentPick();
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
            Script.viewport.camera.attachToNode(this);
            // Move the default camera
            Script.viewport.camera.mtxPivot.translateY(1);
            Script.viewport.camera.mtxPivot.rotateX(60);
        }
        control() {
            const rigidBody = this.getComponent(ƒ.ComponentRigidbody);
            let movementSpeed = 6;
            let horizontalRotationSpeed = 5;
            let verticalRotationSpeed = 2;
            let xVelocity = 0;
            let yVelocity = 0;
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
            newVelocity = ƒ.Vector3.TRANSFORMATION(newVelocity, this.mtxLocal, false);
            newVelocity.y = currentVelocity.y + yVelocity;
            rigidBody.setVelocity(newVelocity);
            let newRotation = new ƒ.Vector3(xRotationVelocity, 0, 0);
            newRotation = ƒ.Vector3.TRANSFORMATION(newRotation, this.mtxLocal, false);
            newRotation.y = yRotationVelocity;
            rigidBody.setAngularVelocity(newRotation);
        }
    }
    Script.Steve = Steve;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map