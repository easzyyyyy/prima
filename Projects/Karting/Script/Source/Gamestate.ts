namespace Script {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;

    export class Gamestate extends ƒ.Mutable {
        public speed: number;

        constructor() {
            super();
            this.speed = 0;

            let vui: HTMLDivElement = document.querySelector(".vui");
            console.log(vui);
            
            new ƒUi.Controller(this, vui);
        }

        protected reduceMutator(_mutator: ƒ.Mutator): void {
        }
    }
}
