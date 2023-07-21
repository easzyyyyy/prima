namespace Script {
    export class Config {
            static path: string = "/prima/Projects/Karting/config.json";

        constructor() {}

        static async load() {
            const stringConfig = await (await fetch(this.path)).text();
            const jsonConfig = JSON.parse(stringConfig);
            return jsonConfig
        }
    }
}
