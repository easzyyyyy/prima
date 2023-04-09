namespace Script {
    import ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");

    let viewport: ƒ.Viewport;
    let sonic: Sprite;
    let terrain: ƒ.Node;

    document.addEventListener("interactiveViewportStarted", <EventListener>start);
    // document.addEventListener("keydown", handleKeyboard);

    function start(_event: CustomEvent): void {
        viewport = _event.detail;

        const sonicNode = viewport.getBranch().getChildrenByName('Sonic')[0];
        sonic = new Sprite(sonicNode, 'Sonic');
        // let cmpSonic: ƒ.ComponentTransform = sonic.getComponent(ƒ.ComponentTransform);
        // cmpSonic.mtxLocal.translateX(1);

        // Move the default camera
        viewport.camera.mtxPivot.translateZ(15);
        viewport.camera.mtxPivot.rotateY(180);

        viewport.camera.mtxPivot.translateX(-4.5);
        viewport.camera.mtxPivot.translateY(3.5);

        // Load terrain
        terrain = viewport.getBranch().getChildrenByName('Terrain')[0];

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        // let timeStamp = _event.timeStamp;

        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();

        // Make sonic move
        let sonicPos = sonic.getX();
        if (sonicPos > 9.2) {
            sonic.setX(0);
        } else if (sonicPos < -0.1) {
            sonic.setX(9.2);
        }

        // Control sonic

        // Right and Left
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
            sonic.speedX = 6;
        } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
            sonic.speedX = -6;
        } else {
            sonic.speedX = 0;
        }

        // // Right and Left fun
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
        //   sonic.accX = 0.005;
        // } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
        //   sonic.accX = -0.005;
        // } else {
        //   sonic.accX = 0;
        //   sonic.speedX /= 1.1;
        // }

        // Jump
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE, ƒ.KEYBOARD_CODE.ARROW_UP])) {
            sonic.jump();
        }

        for (const block of terrain.getChildren()) {
            block
            // if (collide(sonic.node, block)) {

            // }
        }

        sonic.move();
        sonic.anim();

        let tiles: ƒ.Node[] = viewport.getBranch().getChildrenByName("Terrain")[0].getChildren()
        for (let tile of tiles) {
            const collision = collide(sonic.node, tile)
            if (collision === 'top') {
                sonic.isJumping = false;
                sonic.speedY = 0;
            }
            if (collision === 'bottom') {
                sonic.speedY = 0;
            }
            if (collision === 'right') {
                sonic.speedX = 0;
            }
            if (collision === 'left') {
                sonic.speedX = 0;
            }
        }
    }
}
