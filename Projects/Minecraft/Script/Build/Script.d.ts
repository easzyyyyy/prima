declare namespace Script {
    import ƒ = FudgeCore;
    class Block extends ƒ.Node {
        static mesh: ƒ.MeshCube;
        static material: ƒ.Material;
        constructor(position: ƒ.Vector3, color: ƒ.Color);
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        IDLE = 0,
        WALK = 1,
        RUN = 2
    }
    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        distanceWalk: number;
        distanceRun: number;
        private geometry;
        private cmpBody;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actDefault;
        private static actIdle;
        private static actWalk;
        private static actRun;
        private static transitWalk;
        private hndEvent;
        private update;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CreeperScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        geometry: ƒ.Node;
        constructor();
        hndEvent: (_event: Event) => void;
        init(): void;
        move(): void;
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
    class Steve {
        isGrounded: boolean;
        state: string;
        node: ƒ.Node;
        geometry: ƒ.Node;
        constructor(node: ƒ.Node);
        collides(_event: ƒ.EventPhysics, steve: Steve): void;
        setCamera(): void;
        animate(): void;
        control(): void;
    }
}
