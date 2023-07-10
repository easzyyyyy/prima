namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

    enum JOB {
        IDLE, WALK, RUN
    }

    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(StateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = StateMachine.get();
        public distanceWalk: number = 5;
        public distanceRun: number = 2;
        private geometry: ƒ.Node;
        private cmpBody: ƒ.ComponentRigidbody;


        constructor() {
            super();
            this.instructions = StateMachine.instructions; // setup instructions with the static set

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
            return;

            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.actDefault = StateMachine.actDefault;
            setup.setAction(JOB.IDLE, <ƒ.General>this.actIdle);
            setup.setAction(JOB.WALK, <ƒ.General>this.actWalk);
            setup.setAction(JOB.RUN, <ƒ.General>this.actRun);
            setup.setTransition(JOB.IDLE, JOB.WALK, <ƒ.General>this.transitWalk);
            return setup;
        }

        private static transitDefault(_machine: StateMachine): void {
            // console.log("Transit to", _machine.stateNext);
        }

        private static async actDefault(_machine: StateMachine): Promise<void> {
            console.log(JOB[_machine.stateCurrent]);
        }

        private static async actIdle(_machine: StateMachine): Promise<void> {
            if (!steve) return

            const difference = ƒ.Vector3.DIFFERENCE(steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);

            if (difference.magnitude < _machine.distanceRun) {
                _machine.transit(JOB.RUN);
            } else if (difference.magnitude < _machine.distanceWalk) {
                _machine.transit(JOB.WALK);
            }

            _machine.cmpBody.setVelocity(ƒ.Vector3.ZERO());

            StateMachine.actDefault(_machine);
        }

        private static async actWalk(_machine: StateMachine): Promise<void> {
            if (!steve) return

            const difference = ƒ.Vector3.DIFFERENCE(steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);

            if (difference.magnitude > _machine.distanceWalk) {
                _machine.transit(JOB.IDLE);
            } else if (difference.magnitude < _machine.distanceRun) {
                _machine.transit(JOB.RUN);
            }

            const direction = ƒ.Vector3.NORMALIZATION(difference, 1);

            const currentVelocity = _machine.cmpBody.getVelocity();
            const newVelocity = ƒ.Vector3.SCALE(direction, 2);
            newVelocity.y = currentVelocity.y;
            _machine.cmpBody.setVelocity(newVelocity);

            StateMachine.actDefault(_machine);
        }

        private static async actRun(_machine: StateMachine): Promise<void> {
            if (!steve) return

            const difference = ƒ.Vector3.DIFFERENCE(steve.geometry.mtxWorld.translation, _machine.geometry.mtxWorld.translation);

            if (difference.magnitude > _machine.distanceWalk) {
                _machine.transit(JOB.IDLE);
            } else if (difference.magnitude > _machine.distanceRun) {
                _machine.transit(JOB.WALK);
            }

            const direction = ƒ.Vector3.NORMALIZATION(difference, 1);

            const currentVelocity = _machine.cmpBody.getVelocity();
            const newVelocity = ƒ.Vector3.SCALE(direction, 4);
            newVelocity.y = currentVelocity.y;
            _machine.cmpBody.setVelocity(newVelocity);

            StateMachine.actDefault(_machine);
        }

        private static transitWalk(_machine: StateMachine): void {
        }

        // Activate the functions of this component as response to events
        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case ƒ.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    break;
                case ƒ.EVENT.NODE_DESERIALIZED:
                    this.geometry = this.node.getChildrenByName("Geometry")[0];
                    this.cmpBody = this.geometry.getComponent(ƒ.ComponentRigidbody);

                    this.cmpBody.effectRotation = ƒ.Vector3.Y();
                    this.cmpBody.dampTranslation = 1;
                    this.cmpBody.dampRotation = 1;
                    this.cmpBody.friction = 0;

                    this.transit(JOB.IDLE);

                    break;
            }
        }

        private update = (_event: Event): void => {
            this.act();
        }
    }
}