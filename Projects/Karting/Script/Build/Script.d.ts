declare namespace Script {
    class Config {
        static path: string;
        constructor();
        static load(): Promise<any>;
    }
}
declare namespace Script {
    function timeBased(value: number): number;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Gamestate extends ƒ.Mutable {
        speed: number;
        isLapValid: boolean;
        checkpoint: boolean;
        lapTime: number;
        bestTime: number;
        currentLapTime: number;
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
        view: string;
        lap: Lap;
        constructor(node: ƒ.Node);
        firstPerson(): void;
        thirdPerson(): void;
        setupAudio(): void;
        playEngineSound(): void;
        loop(): void;
        updateLapInfo(): void;
        control(): void;
    }
}
declare namespace Script {
    class Lap {
        start: boolean;
        finish: boolean;
        checkpoint: boolean;
        valid: boolean;
        startTime: number;
        finishTime: number;
        lapTime: number;
        constructor();
        isLapValid(): boolean;
        getLapTime(): number;
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
    let config: any;
    enum TrackState {
        ON_TRACK = 0,
        OFF_TRACK = 1,
        CHECKPOINT = 2,
        START = 3
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class SpectatorComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
        anim(): void;
    }
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
        previousColor: string;
        constructor(node: ƒ.Node);
        loadTextures(): Promise<void>;
        placeStart(): void;
        placeKart(): void;
        checkOnTrack(pos: ƒ.Vector3): TrackState;
    }
}
