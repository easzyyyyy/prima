namespace Script {
    import ƒ = FudgeCore;

    export class Track extends ƒ.Node {
        node: ƒ.Node;
        texture: ƒ.Node;
        pick: ƒ.Node;
        startNode: ƒ.Node;
        startPos: ƒ.Vector3;
        startAng: ƒ.Vector3;

        // Used to check if the new color is different in the checkOnTrack function
        previousColor: string;

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
            // "/prima/Projects/Karting/Images/track_texture.jpg"

            await trackTexture.load("/prima/Projects/Karting/Images/track_texture.jpg");
            const trackCoat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), trackTexture);
            const trackMaterial = new ƒ.Material("TrackTexture", ƒ.ShaderFlatTextured, trackCoat)
            const cpmTrackMaterial = new ƒ.ComponentMaterial(trackMaterial);

            this.texture.addComponent(cpmTrackMaterial);

            const pickTexture = new ƒ.TextureImage();
            // "/prima/Projects/Karting/Images/track_pick.jpg"

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
            karting.rigidBody.setVelocity(ƒ.Vector3.ZERO());
            karting.rigidBody.setAngularVelocity(ƒ.Vector3.ZERO());
        }

        checkOnTrack(pos: ƒ.Vector3) {
            const ray: ƒ.Ray = new ƒ.Ray(ƒ.Vector3.Y(-1), pos, 1);
            let picks: ƒ.Pick[] = ƒ.Picker.pickRay([track.pick], ray, 0, 1);
            const pick = picks[0];
            const color = pick?.color?.getHex();
            if (color == this.previousColor) return TrackState.ON_TRACK;
            this.previousColor = color;

            switch (color) {
                case "ffffffff":
                    return TrackState.ON_TRACK

                case "000000ff":
                    return TrackState.OFF_TRACK

                case "01f801ff":
                    return TrackState.START

                case "ff2700ff":
                    return TrackState.CHECKPOINT

                default:
                    return TrackState.ON_TRACK;
            }
        }
    }
}