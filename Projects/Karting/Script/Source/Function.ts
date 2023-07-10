namespace Script {
    import ƒ = FudgeCore;

    export function timeBased(value: number) {
        return value * ƒ.Loop.timeFrameGame / 1000;
    }
}