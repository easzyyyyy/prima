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

    export function getSortedPicksByCamera(_event: PointerEvent): ƒ.Pick[] {
        let picks: ƒ.Pick[] = ƒ.Picker.pickViewport(viewport, new ƒ.Vector2(_event.clientX, _event.clientY));
        picks.sort((_a, _b) => _a.zBuffer - _b.zBuffer);
        return picks;
    }

    export function removeBlock(_event: PointerEvent) {
        const block: ƒ.Node = getSortedPicksByCamera(_event)[0]?.node;
        if (block) {
            block.getParent().removeChild(block);
            viewport.draw();
        }
    }

    export function placeBlock(_event: PointerEvent) {
        const nearestPick = getSortedPicksByCamera(_event)[0]
        const block: ƒ.Node = nearestPick?.node;
        if (block) {
            const position = ƒ.Vector3.SUM(block.mtxLocal.translation, nearestPick.normal)
            const color = new ƒ.Color(255, 0, 0);
            const newBlock = new Block(position, color);

            block.getParent().addChild(newBlock);
            viewport.draw();
        }
    }
}