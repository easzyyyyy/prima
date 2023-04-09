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
    function timeBased(value: number): number;
    function collide(node1: ƒ.Node, node2: ƒ.Node): string;
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Sprite {
        name: string;
        speedX: number;
        speedY: number;
        accX: number;
        accY: number;
        isJumping: boolean;
        node: ƒ.Node;
        constructor(node: ƒ.Node, name: string);
        getX(): number;
        getY(): number;
        getPos(): ƒ.Vector3;
        setX(x: number): void;
        setY(y: number): void;
        setPos(x: number, y: number): void;
        /**
         * 1 = right, -1 = left
         * @returns side
         */
        getSide(): number;
        /**
         * 1 = right, -1 = left
         * @param side
         */
        setSide(side: number): void;
        move(): void;
        anim(): void;
        jump(): void;
    }
}
