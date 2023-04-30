namespace Script {
    import ƒ = FudgeCore;

    export function timeBased(value: number) {
        return value * ƒ.Loop.timeFrameGame / 1000;
    }

    export function collide(node1: ƒ.Node, node2: ƒ.Node): boolean {
        let node1Pos = node1.mtxLocal.translation
        let pos: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(node1Pos, node2.mtxWorldInverse, true);
        if (pos.y < 0.5 && pos.x > -0.5 && pos.x < 0.5) {
            pos.y = 0.5;
            pos = ƒ.Vector3.TRANSFORMATION(pos, node2.mtxWorld, true)
            node1.mtxLocal.translation = pos;
            return true;
        }
        return false
    }

    export function cameraFollowSprite(sprite: ƒ.Node, viewport: ƒ.Viewport) {
        // Move camera on x only
        let difference = viewport.camera.mtxPivot.translation
        difference.x = sprite.mtxLocal.translation.x
        viewport.camera.mtxPivot.translation = difference

        // Move camera on x and y
        // let difference = sprite.mtxLocal.translation
        // difference.z = viewport.camera.mtxPivot.translation.z
        // viewport.camera.mtxPivot.translation = difference

        // Displays bugs
        // let mutator: ƒ.Mutator = sprite.mtxLocal.getMutator()
        // viewport.camera.mtxPivot.mutate({
        //     "translation": {
        //         "x": mutator.translation.x,
        //         "y": mutator.translation.y
        //     }
        // })
    }
}
