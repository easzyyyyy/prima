namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class CreeperScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(CreeperScript);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "CreeperScript added to ";

    geometry: ƒ.Node = null;

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Debug.log(this.message, this.node);
          this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.hndEvent);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
        case ƒ.EVENT.RENDER_PREPARE:
          this.move();
          break;
      }
    }

    init() {

    }

    move() {
      if (!steve) return

      if (!this.geometry) {
        this.geometry = this.node.getChildrenByName("Geometry")[0];

        const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);
        cmpRigidBody.effectRotation = ƒ.Vector3.Y();
        cmpRigidBody.dampTranslation = 1;
        cmpRigidBody.dampRotation = 1;
        cmpRigidBody.friction = 0;
      }

      const cmpRigidBody = this.geometry.getComponent(ƒ.ComponentRigidbody);

      const difference = ƒ.Vector3.DIFFERENCE(steve.geometry.mtxWorld.translation, this.geometry.mtxWorld.translation);
      const direction = ƒ.Vector3.NORMALIZATION(difference, 1);

      const currentVelocity = cmpRigidBody.getVelocity();
      const newVelocity = ƒ.Vector3.SCALE(direction, 2);
      newVelocity.y = currentVelocity.y;
      cmpRigidBody.setVelocity(newVelocity);
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}