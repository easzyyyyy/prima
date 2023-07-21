namespace Script {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;

    export class Gamestate extends ƒ.Mutable {
        public speed: number;
        public isLapValid: boolean;
        public checkpoint: boolean;
        public lapTime: number;
        public bestTime: number;
        public currentLapTime: number;

        constructor() {
            super();
            this.speed = 0;
            this.isLapValid = false;
            this.checkpoint = false;
            this.lapTime = 0;
            this.bestTime = 0;
            this.currentLapTime = 0;

            let vui: HTMLDivElement = document.querySelector(".vui");
            new ƒUi.Controller(this, vui);
        }

        protected reduceMutator(_mutator: ƒ.Mutator): void {
        }
    }
}
