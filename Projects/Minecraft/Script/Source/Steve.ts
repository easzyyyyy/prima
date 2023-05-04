namespace Script {
    import ƒ = FudgeCore;

    export class Steve extends ƒ.Node {
        static mesh: ƒ.MeshCube = new ƒ.MeshCube("SteveMesh");
        static material: ƒ.Material = new ƒ.Material("SteveMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive());

        constructor(position: ƒ.Vector3, color: ƒ.Color) {
            super("Steve");
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(position)));
            this.addComponent(new ƒ.ComponentMesh(Block.mesh));
            this.addComponent(new ƒ.ComponentRigidbody(100, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CUBE));

            let cmpMaterial = new ƒ.ComponentMaterial(Block.material);
            cmpMaterial.clrPrimary = color;
            this.addComponent(cmpMaterial);

            let cmpPick: ƒ.ComponentPick = new ƒ.ComponentPick();
            cmpPick.pick = ƒ.PICK.CAMERA;
            this.addComponent(cmpPick);
        }
    }
}