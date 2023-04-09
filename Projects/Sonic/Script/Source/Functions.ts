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

    export function collide(node1: ƒ.Node, node2: ƒ.Node): string {
        const posWorld = node1.mtxLocal.translation;
        const pos = ƒ.Vector3.TRANSFORMATION(posWorld, node2.mtxWorldInverse, true);

        const isOnBlockHorrizontally = pos.x < 0.9 && pos.x > -0.9
        const isOnBlockVertically = pos.y < 0.9 && pos.y > -0.9

        if (isOnBlockHorrizontally) {
            if (pos.y < 1 && pos.y > 0) {
                node1.mtxLocal.translateY(1 - pos.y)
                return 'top'
            }

            if (pos.y < 0 && pos.y > -1) {
                node1.mtxLocal.translateY(-(1 + pos.y))
                return 'bottom'
            }
        }

        if (isOnBlockVertically) {
            if (pos.x < 1 && pos.x > 0) {
                node1.mtxLocal.translateX(1 - pos.x)
                return 'right'
            }

            if (pos.x < 0 && pos.x > -1) {
                node1.mtxLocal.translateX(-(1 + pos.x))
                return 'left'
            }
        }



        return null
    }
}
