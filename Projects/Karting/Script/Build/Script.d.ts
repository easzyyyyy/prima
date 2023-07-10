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
    function timeBased(value: number): number;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Gamestate extends ƒ.Mutable {
        speed: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Karting extends ƒ.Node {
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
        constructor(node: ƒ.Node);
        firstPerson(): void;
        thirdPerson(): void;
        setupAudio(): void;
        playEngineSound(): void;
        loop(): void;
        control(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    let graph: ƒ.Node;
    let camera: ƒ.ComponentCamera;
    let karting: Karting;
    let track: Track;
    let gamestate: Gamestate;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Track extends ƒ.Node {
        node: ƒ.Node;
        texture: ƒ.Node;
        pick: ƒ.Node;
        startNode: ƒ.Node;
        startPos: ƒ.Vector3;
        startAng: ƒ.Vector3;
        constructor(node: ƒ.Node);
        loadTextures(): Promise<void>;
        placeStart(): void;
        placeKart(): void;
        checkOnTrack(pos: ƒ.Vector3): void;
    }
}
