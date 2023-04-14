namespace Script {
    import ƒ = FudgeCore;

    export function timeBased(value: number) {
        return value * ƒ.Loop.timeFrameGame / 1000;
    }

    // export function collide(node1: ƒ.Node, node2: ƒ.Node) {
    //     // console.log(node1.mtxWorld);
    //     // console.log(node2.mtxWorld);
    //     // console.log(node2.mtxWorldInverse);
    //     // mtxWorldInverse is not a function, how can we transform a point from world to local
    //     debugger
    //     return true;
    // }

    export function collide(node1: ƒ.Node, node2: ƒ.Node): boolean {
        const posWorld = node1.mtxLocal.translation;
        const pos = ƒ.Vector3.TRANSFORMATION(posWorld, node2.mtxWorldInverse, true);
        let collision = false

        const isOnBlockHorrizontally = pos.x < 0.5 && pos.x > -0.5
        const isOnBlockVertically = pos.y < 0.5 && pos.y > -0.5

        if (isOnBlockHorrizontally) {
            if (pos.y < 1 && pos.y > 0) {
                node1.mtxLocal.translateY(1 - pos.y)
                collision = true
            }

            if (pos.y < 0 && pos.y > -1) {
                node1.mtxLocal.translateY(-(1 + pos.y))
                collision = true
            }
        }

        if (isOnBlockVertically) {
            if (pos.x < 1 && pos.x > 0) {
                node1.mtxLocal.translateX(-(1 - pos.x))
                collision = true
            }

            if (pos.x < 0 && pos.x > -1) {
                node1.mtxLocal.translateX(-(1 + pos.x))
                collision = true
            }
        }

        return collision
    }

    export function cameraFollowSprite(sprite: ƒ.Node, viewport: ƒ.Viewport) {
        // Move camera on x only
        let pos = viewport.camera.mtxPivot.translation
        pos.x = sprite.mtxLocal.translation.x
        viewport.camera.mtxPivot.translation = pos

        // Move camera on x and y
        // let pos = sprite.mtxLocal.translation
        // pos.z = viewport.camera.mtxPivot.translation.z
        // viewport.camera.mtxPivot.translation = pos

        // Display bugs
        // let mutator: ƒ.Mutator = sprite.mtxLocal.getMutator()
        // viewport.camera.mtxPivot.mutate({
        //     "translation": {
        //         "x": mutator.translation.x,
        //         "y": mutator.translation.y
        //     }
        // })
    }
}
