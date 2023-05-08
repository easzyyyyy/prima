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
    function getSortedPicksByCamera(_event: PointerEvent): ƒ.Pick[];
    function removeBlock(block: ƒ.Node): void;
    function placeBlock(parent: ƒ.Node, position: ƒ.Vector3, color: ƒ.Color): void;
    function interactWithBlock(_event: PointerEvent): void;
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    let steve: Steve;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Steve extends ƒ.Node {
        static mesh: ƒ.MeshCube;
        static material: ƒ.Material;
        constructor(position: ƒ.Vector3, color: ƒ.Color);
        scale(): void;
        setCamera(): void;
        control(): void;
    }
}
