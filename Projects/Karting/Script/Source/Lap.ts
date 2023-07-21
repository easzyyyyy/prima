namespace Script {
    export class Lap {
        start: boolean;
        finish: boolean;
        checkpoint: boolean;
        valid: boolean;
        startTime: number;
        finishTime: number;
        lapTime: number;

        constructor() {
            this.start = true;
            this.finish = false;
            this.checkpoint = false;
            this.valid = true;
            this.startTime = 0;
            this.finishTime = 0;
            this.lapTime = 0;
        }

        isLapValid() {
            this.valid = this.start && this.finish && this.checkpoint;
            return this.valid;
        }

        getLapTime() {
            if (this.isLapValid() && this.startTime != 0 && this.finishTime != 0) {
                this.lapTime = (this.finishTime - this.startTime)/1000;
            }
            return Math.round(this.lapTime*1000)/1000;
        }
    }
}