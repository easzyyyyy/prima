namespace Script {
    import ƒ = FudgeCore;

    export class Track extends ƒ.Node {
        node: ƒ.Node;
        texture: ƒ.Node;
        pick: ƒ.Node;
        startNode: ƒ.Node;
        startPos: ƒ.Vector3;
        startAng: ƒ.Vector3;

        constructor(node: ƒ.Node) {
            super('Track');

            this.node = node;
            this.texture = this.node.getChildrenByName('Texture')[0];
            this.pick = this.node.getChildrenByName('Pick')[0];

            this.startNode = graph.getChildrenByName('Start')[0];
            this.startPos = this.startNode.mtxLocal.translation.clone;
            this.startAng = this.startNode.mtxLocal.rotation.clone;

            this.placeStart();
            this.placeKart();
        }

        async loadTextures() {
            const trackTexture = new ƒ.TextureImage();
            await trackTexture.load("/prima/Projects/Karting/Images/track_texture.jpg");
            const trackCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), trackTexture);
            const trackMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, trackCoat)
            const cpmTrackMaterial = new ƒ.ComponentMaterial(trackMaterial);

            this.texture.addComponent(cpmTrackMaterial);

            const pickTexture = new ƒ.TextureImage();
            await pickTexture.load("/prima/Projects/Karting/Images/track_pick.jpg");
            const pickCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), pickTexture);
            const pickMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, pickCoat)
            const cpmPickMaterial = new ƒ.ComponentMaterial(pickMaterial);

            this.pick.addComponent(cpmPickMaterial);
        }

        placeStart() {
            this.startNode.mtxLocal.translation = this.startPos;
            this.startNode.mtxLocal.translateX(5);

            this.startNode.mtxLocal.rotation = this.startAng;
        }

        placeKart() {
            karting.rigidBody.setPosition(this.startPos);
            karting.rigidBody.setRotation(this.startAng);
        }

        checkOnTrack(pos: ƒ.Vector3) {
            const ray: ƒ.Ray = new ƒ.Ray(ƒ.Vector3.Y(1), pos, 10)

            let picks: ƒ.Pick[] = ƒ.Picker.pickRay([track.node], ray, 1, 100);
            console.log(picks);
        }
    }
}