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
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["WALK"] = 1] = "WALK";
        JOB[JOB["RUN"] = 2] = "RUN";
    })(JOB || (JOB = {}));
    class StateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(StateMachine);
        static instructions = StateMachine.get();
        distanceWalk = 5;
        distanceRun = 2;
        geometry;
        cmpBody;
        constructor() {
            super();
            this.instructions = StateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.actDefault = StateMachine.actDefault;
            setup.setAction(JOB.IDLE, this.actIdle);
            setup.setAction(JOB.WALK, this.actWalk);
            setup.setAction(JOB.RUN, this.actRun);
            setup.setTransition(JOB.IDLE, JOB.WALK, this.transitWalk);
            return setup;
        }
        static transitDefault(_machine) {
            // console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            console.log(JOB[_machine.stateCurrent]);
        }
        static async actIdle(_machine) {
            if (!Script.steve)
                return;
            const difference = ƒ.Vector3.DIFFERENCE(Script.steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);
            if (difference.magnitude < _machine.distanceRun) {
                _machine.transit(JOB.RUN);
            }
            else if (difference.magnitude < _machine.distanceWalk) {
                _machine.transit(JOB.WALK);
            }
            _machine.cmpBody.setVelocity(ƒ.Vector3.ZERO());
            StateMachine.actDefault(_machine);
        }
        static async actWalk(_machine) {
            if (!Script.steve)
                return;
            const difference = ƒ.Vector3.DIFFERENCE(Script.steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);
            if (difference.magnitude > _machine.distanceWalk) {
                _machine.transit(JOB.IDLE);
            }
            else if (difference.magnitude < _machine.distanceRun) {
                _machine.transit(JOB.RUN);
            }
            const direction = ƒ.Vector3.NORMALIZATION(difference, 1);
            const currentVelocity = _machine.cmpBody.getVelocity();
            const newVelocity = ƒ.Vector3.SCALE(direction, 2);
            newVelocity.y = currentVelocity.y;
            _machine.cmpBody.setVelocity(newVelocity);
            StateMachine.actDefault(_machine);
        }
        static async actRun(_machine) {
            if (!Script.steve)
                return;
            const difference = ƒ.Vector3.DIFFERENCE(Script.steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);
            if (difference.magnitude > _machine.distanceWalk) {
                _machine.transit(JOB.IDLE);
            }
            else if (difference.magnitude > _machine.distanceRun) {
                _machine.transit(JOB.WALK);
            }
            const direction = ƒ.Vector3.NORMALIZATION(difference, 1);
            const currentVelocity = _machine.cmpBody.getVelocity();
            const newVelocity = ƒ.Vector3.SCALE(direction, 4);
            newVelocity.y = currentVelocity.y;
            _machine.cmpBody.setVelocity(newVelocity);
            StateMachine.actDefault(_machine);
        }
        static transitWalk(_machine) {
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    ƒ.Loop.removeEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.geometry = this.node.getChildrenByName("Geometry")[0];
                    this.cmpBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody.effectRotation = ƒ.Vector3.Y();
                    this.cmpBody.dampTranslation = 1;
                    this.cmpBody.dampRotation = 1;
                    this.cmpBody.friction = 0;
                    this.transit(JOB.IDLE);
                    break;
            }
        };
        update = (_event) => {
            this.act();
        };
    }
    Script.StateMachine = StateMachine;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CreeperScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CreeperScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CreeperScript added to ";
        geometry = null;
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
                    this.move();
                    break;
            }
        };
        init() {
        }
        move() {
            if (!Script.steve)
                return;
            if (!this.geometry) {
                this.geometry = this.node.getChildrenByName("Geometry")[0];
                const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
                cmpRigidBody.effectRotation = ƒ.Vector3.Y();
                cmpRigidBody.dampTranslation = 1;
                cmpRigidBody.dampRotation = 1;
                cmpRigidBody.friction = 0;
            }
            const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
            const difference = ƒ.Vector3.DIFFERENCE(Script.steve.geometry.mtxWorld.translation, this.geometry.mtxWorld.translation);
            const direction = ƒ.Vector3.NORMALIZATION(difference, 1);
            const currentVelocity = cmpRigidBody.getVelocity();
            const newVelocity = ƒ.Vector3.SCALE(direction, 2);
            newVelocity.y = currentVelocity.y;
            cmpRigidBody.setVelocity(newVelocity);
        }
    }
    Script.CreeperScript = CreeperScript;
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
    }
    Script.interactWithBlock = interactWithBlock;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    // enum MINECRAFT {
    //     STEVE_COLLIDED = 'steveCollided'
    // }
    // @ts-ignore
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        Script.viewport = _event.detail;
        // View the colliders wireframe
        Script.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;
        // Create map
        Script.createMap(9, 1, 9, Script.viewport.getBranch());
        // Create Steve
        const steveNode = Script.viewport.getBranch().getChildrenByName("Steve")[0];
        Script.steve = new Script.Steve(steveNode);
        // @ts-ignore
        Script.viewport.canvas.addEventListener("pointerdown", Script.interactWithBlock);
        // Dispatch event example
        // viewport.getBranch().addEventListener(MINECRAFT.STEVE_COLLIDED, (_event: Event) => {
        //     console.log(_event);
        // });
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
        Script.steve.animate();
        ƒ.Physics.simulate(); // If physics is included and used
        Script.viewport.draw();
        // ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Steve {
        isGrounded = false;
        state = "Idle";
        node = null;
        geometry = null;
        constructor(node) {
            this.node = node;
            this.geometry = this.node.getChildrenByName("Geometry")[0];
            // this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            // this.addComponent(new ƒ.ComponentMesh(Block.mesh));
            // this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CAPSULE));
            const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
            cmpRigidBody.effectRotation = ƒ.Vector3.Y();
            cmpRigidBody.dampTranslation = 1;
            cmpRigidBody.dampRotation = 1;
            cmpRigidBody.friction = 0;
            cmpRigidBody.addEventListener("ColliderEnteredCollision" /* ƒ.EVENT_PHYSICS.COLLISION_ENTER */, (_event) => {
                this.collides(_event, this);
            });
            let cmpPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            this.node.addComponent(cmpPick);
            this.setCamera();
        }
        collides(_event, steve) {
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
            Script.viewport.camera.attachToNode(this.geometry);
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
            Script.viewport.camera.mtxPivot.translateY(0);
            Script.viewport.camera.mtxPivot.translateZ(-5);
            // viewport.camera.mtxPivot.rotateX(60);
        }
        animate() {
            const cmpAnimator = this.geometry.getComponent(ƒ.ComponentAnimator);
            const animation = ƒ.Project.getResourcesByName(this.state)[0];
            if (cmpAnimator.animation != animation) {
                if (this.state == "Jump") {
                    cmpAnimator.playmode = ƒ.ANIMATION_PLAYMODE.PLAY_ONCE;
                    cmpAnimator.animation = animation;
                }
                else if (this.isGrounded) {
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
            let yVelocity = 0;
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
                Script.viewport.camera.mtxPivot.rotateX(-1);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) {
                Script.viewport.camera.mtxPivot.rotateX(1);
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
            newVelocity = ƒ.Vector3.TRANSFORMATION(newVelocity, this.geometry.mtxLocal, false);
            newVelocity.y = currentVelocity.y + yVelocity;
            rigidBody.setVelocity(newVelocity);
            let newRotation = new ƒ.Vector3(0, yRotationVelocity, 0);
            rigidBody.setAngularVelocity(newRotation);
        }
    }
    Script.Steve = Steve;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map