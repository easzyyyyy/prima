namespace Script {
    import ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");

    export let viewport: ƒ.Viewport;
    export let steve: Steve;

    // enum MINECRAFT {
    //     STEVE_COLLIDED = 'steveCollided'
    // }

    // @ts-ignore
    document.addEventListener("interactiveViewportStarted", start);

    async function start(_event: CustomEvent): Promise<void> {
        viewport = _event.detail;

        // View the colliders wireframe
        viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.COLLIDERS;

        // Create map
        createMap(9, 1, 9, viewport.getBranch());

        // Create Steve
        const steveNode = viewport.getBranch().getChildrenByName("Steve")[0];
        steve = new Steve(steveNode);

        // @ts-ignore
        viewport.canvas.addEventListener("pointerdown", interactWithBlock);

        // Dispatch event example
        // viewport.getBranch().addEventListener(MINECRAFT.STEVE_COLLIDED, (_event: Event) => {
        //     console.log(_event);
        // });

        // Do not display the context menu on right click
        viewport.canvas.addEventListener("contextmenu", (_event) => {
            _event.preventDefault();
            return false;
        });

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start(); // Start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        steve.control();
        steve.animate();

        ƒ.Physics.simulate(); // If physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();
    }
}