namespace Script {
    import ƒ = FudgeCore;

    export function createMap(xSize: number, ySize: number, zSize: number, graph: ƒ.Node) {
        for (let i = 0; i < xSize; i++) {
            for (let j = 0; j < ySize; j++) {
                for (let k = 0; k < zSize; k++) {
                    const position = new ƒ.Vector3(i, j, k);
                    const color = new ƒ.Color(i/xSize, j/ySize, k/zSize);
                    const block = new Block(position, color);
                    graph.addChild(block);
                }
            }
        }
    }

    export function pickNearestBlock(_event: PointerEvent, viewport: ƒ.Viewport) {
        let blocksList: ƒ.Node[] = []

        // @ts-ignore
        viewport.getBranch().addEventListener(_event.type, hit);

        // No _event.pick here, how to get the list
        // @ts-ignore
        // let pick = _event.pick;
        viewport.draw();
        viewport.dispatchPointerEvent(_event);


        function hit(_event: PointerEvent): void {
            let node: ƒ.Node = <ƒ.Node>_event.target;
            if (node.name == "Block") {
                blocksList.push(node);
            }
        }

        blocksList.sort((a, b) => {
            const cameraTranslation = viewport.camera.mtxWorld.translation;
            const distanceA: number = cameraTranslation.getDistance(a.mtxWorld.translation);
            const distanceB: number = cameraTranslation.getDistance(b.mtxWorld.translation);

            console.log(distanceA);

            return distanceA - distanceB;
        })

        // @ts-ignore
        viewport.getBranch().removeEventListener("click", hit);

        return blocksList.length > 0 ? blocksList[0] : null;
    }

    export function removeNearestBlock(_event: PointerEvent, viewport: ƒ.Viewport) {
        const block: ƒ.Node = pickNearestBlock(_event, viewport);
        if (block) {
            block.getParent().removeChild(block);
        }
    }
}