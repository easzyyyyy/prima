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
            let cmpMaterial = new ƒ.ComponentMaterial(Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);
            // let cmpPick: ƒ.ComponentPick = new ƒ.ComponentPick();
            // cmpPick.pick = ƒ.PICK.RADIUS;
            // this.addComponent(cmpPick);
            let cmpPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
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
    function pickNearestBlock(_event, viewport) {
        let blocksList = [];
        // @ts-ignore
        viewport.getBranch().addEventListener(_event.type, hit);
        // No _event.pick here, how to get the list
        // @ts-ignore
        // let pick = _event.pick;
        viewport.draw();
        viewport.dispatchPointerEvent(_event);
        function hit(_event) {
            let node = _event.target;
            if (node.name == "Block") {
                blocksList.push(node);
            }
        }
        blocksList.sort((a, b) => {
            const cameraTranslation = viewport.camera.mtxWorld.translation;
            const distanceA = cameraTranslation.getDistance(a.mtxWorld.translation);
            const distanceB = cameraTranslation.getDistance(b.mtxWorld.translation);
            console.log(distanceA);
            return distanceA - distanceB;
        });
        // @ts-ignore
        viewport.getBranch().removeEventListener("click", hit);
        return blocksList.length > 0 ? blocksList[0] : null;
    }
    Script.pickNearestBlock = pickNearestBlock;
    function removeNearestBlock(_event, viewport) {
        const block = pickNearestBlock(_event, viewport);
        if (block) {
            block.getParent().removeChild(block);
        }
    }
    Script.removeNearestBlock = removeNearestBlock;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    // @ts-ignore
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        viewport = _event.detail;
        // Move the default camera
        viewport.camera.mtxPivot.rotateY(0);
        viewport.camera.mtxPivot.translateZ(-20);
        viewport.camera.mtxPivot.translateX(2.5);
        // Create map
        Script.createMap(5, 5, 5, viewport.getBranch());
        // @ts-ignore
        viewport.canvas.addEventListener("click", (_event) => Script.removeNearestBlock(_event, viewport));
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        // ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map