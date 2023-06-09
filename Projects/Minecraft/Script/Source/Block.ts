namespace Script {
    import ƒ = FudgeCore;

    export class Block extends ƒ.Node {
        static mesh: ƒ.MeshCube = new ƒ.MeshCube("BlockMesh");
        static material: ƒ.Material = new ƒ.Material("BlockMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive());

        constructor(position: ƒ.Vector3, color: ƒ.Color) {
            super("Block");
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            this.addComponent(new ƒ.ComponentMesh(Block.mesh));
            this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.STATIC, ƒ.COLLIDER_TYPE.CUBE));

            let cmpMaterial = new ƒ.ComponentMaterial(Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);

            let cmpPick: ƒ.ComponentPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            // cmpPick.pick = ƒ.PICK.RADIUS;
            this.addComponent(cmpPick);
        }
    }
}