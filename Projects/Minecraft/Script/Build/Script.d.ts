declare namespace Script {
    import ƒ = FudgeCore;
    class Block extends ƒ.Node {
        static mesh: ƒ.MeshCube;
        static material: ƒ.Material;
        constructor(position: ƒ.Vector3, color: ƒ.Color);
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function createMap(xSize: number, ySize: number, zSize: number, graph: ƒ.Node): void;
    function pickNearestBlock(_event: PointerEvent, viewport: ƒ.Viewport): ƒ.Node;
    function removeNearestBlock(_event: PointerEvent, viewport: ƒ.Viewport): void;
}
declare namespace Script {
}
